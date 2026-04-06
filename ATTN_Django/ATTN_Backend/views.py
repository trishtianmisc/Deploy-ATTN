from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, generics
from datetime import date, timedelta
from django.db.models import Sum



import json
from django.contrib.auth.hashers import make_password, check_password
print(make_password("123"))
from django.views.decorators.csrf import csrf_exempt
from .models import Notification

from .models import (
    Product, Category,
    OrderProducts, OrderedItem,
    Ewallet, Account, DebtPayments
)

from .serializers import (
    ProductSerializer, CategorySerializer,
    EwalletSerializer, AccountSerializer,
    OrderProductsSerializer, OrderedItemSerializer, OrderedItemSerializer, DebtPaymentSerializer
)
import logging

logger = logging.getLogger(__name__)



class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer



@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_product(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def product_list(request):
    products = Product.objects.filter(is_active=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PATCH'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
def order_list(request):
    orders = OrderProducts.objects.all()
    serializer = OrderProductsSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(["POST"])
def create_order(request):
    order_data = request.data

    # Create order record
    order = OrderProducts.objects.create(
        status=order_data["status"],
        cus_name=order_data.get("cus_name"),
        contact_num=order_data.get("contact_num"),
        due_date=order_data.get("due_date"),
        total_amt=order_data["total_amt"],
    )

    # Loop through ordered items
    for item in order_data["items"]:
        
        
        product_id = item["product_id"]

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": f"Product ID {product_id} not found"}, status=400)

        qty_ordered = item["qty"]

        # Check stock
        if product.stock < qty_ordered:
            return Response(
                {"error": f"Not enough stock for {product.name}. Only {product.stock} left."},
                status=400,
            )

        # Deduct stock
        product.stock -= qty_ordered
        product.stock_status = product.stock > 0
        product.save()

        # Save ordered item
        OrderedItem.objects.create(
            order=order,
            product_name=item["product_name"],  # ok to store name for display
            qty=item["qty"],
            cost_price=item["cost_price"],
            selling_price=item["selling_price"],
            subtotal=item["subtotal"],
        )

    return Response(OrderProductsSerializer(order).data)

@api_view(['GET'])
def orderitem_list(request):
    items = OrderedItem.objects.select_related("order").all()  # ✔ only valid FK
    serializer = OrderedItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def analytics(request):
    today = date.today()
    week_ago = today - timedelta(days=6)
    month_ago = today - timedelta(days=29)

    # ---- DAILY SALES FOR PAST 7 DAYS ----
    daily_sales = (
        OrderProducts.objects.filter(order_date__gte=week_ago)
        .values("order_date")
        .annotate(total=Sum("total_amt"))
        .order_by("order_date")
    )

    # ---- TOP 5 BEST SELLING PRODUCTS ----
    top_products = (
        OrderedItem.objects.values("product_name")
        .annotate(total_qty=Sum("qty"))
        .order_by("-total_qty")[:5]
    )

    return Response({
        "daily_sales": list(daily_sales),
        "top_products": list(top_products),
    })




@api_view(['POST'])
def add_ewallet(request):
    serializer = EwalletSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ewallet_list(request):
    ewallets = Ewallet.objects.all()
    serializer = EwalletSerializer(ewallets, many=True)
    return Response(serializer.data)




@api_view(["POST"])
def signup(request):
    first_name = request.data.get("FIRST_NAME")
    middle_name = request.data.get("MIDDLE_NAME")
    last_name = request.data.get("LAST_NAME")
    username = request.data.get("USERNAME")
    password = request.data.get("PASSWORD")
    date_of_birth = request.data.get("DATE_OF_BIRTH")

    if Account.objects.filter(USERNAME=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    account = Account(
        USERNAME=username,
        FIRST_NAME=first_name,
        MIDDLE_NAME=middle_name,
        LAST_NAME=last_name,
        DATE_OF_BIRTH=date_of_birth,
    )
    account.set_password(password)
    account.save()

    return Response({"message": "Account created successfully"}, status=201)


@api_view(["POST"])
def login_account(request):
    username = request.data.get("USERNAME")
    password = request.data.get("PASSWORD")

    try:
        account = Account.objects.get(USERNAME=username)
    except Account.DoesNotExist:
        return Response({"error": "Invalid username or password"}, status=400)

    if not account.check_password(password):
        return Response({"error": "Invalid username or password"}, status=400)

    return Response({
        "message": "Login successful",
        "username": account.USERNAME,
        "first_name": account.FIRST_NAME,
        "last_name": account.LAST_NAME
    })
@api_view(['GET'])
def website_description(request):
    products = Product.objects.all().values()
    return Response({"recipes": list(products)})

@api_view(["PATCH"])
def update_order_status(request, pk):
    try:
        order = OrderProducts.objects.get(order_id=pk)
    except OrderProducts.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    new_status = request.data.get("status")

    if new_status not in ["Pending", "Paid"]:
        return Response({"error": "Invalid status"}, status=400)

    order.status = new_status
    order.save()

    return Response({
        "message": "Order status updated",
        "order_id": order.order_id,
        "status": order.status,
    })


@api_view(["GET"])
def order_items(request, order_id):
    try:
        order = OrderProducts.objects.get(order_id=order_id)
    except OrderProducts.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    items = OrderedItem.objects.filter(order=order)

    response_data = []

    for item in items:
       
        product_qs = Product.objects.filter(name__iexact=item.product_name)
        product_obj = product_qs.first()

        if product_qs.count() > 1:
            logger.warning(
                "Multiple Product objects found for name=%s (order_item id=%s). Using the first match.",
                item.product_name,
                getattr(item, 'id', 'N/A'),
            )

        if product_obj:
            category = product_obj.category.name if product_obj.category else "N/A"
            stock_status = product_obj.stock_status
        else:
            category = "N/A"
            stock_status = False

        response_data.append({
            "product_name": item.product_name,
            "category": category,
            "qty": item.qty,
            "selling_price": float(item.selling_price or 0),
            "subtotal": float(item.subtotal or 0),
            "stock_status": stock_status,
        })

    return Response(response_data)
@csrf_exempt
def notification_list(request):
    if request.method == 'GET':
        notifications = Notification.objects.all().values(
            'id', 'product__name', 'notification_type', 'message', 
            'days_until_stockout', 'is_read', 'created_at'
        )
        return JsonResponse(list(notifications), safe=False)

@csrf_exempt
def mark_notification_read(request, id):
    if request.method == 'POST':
        try:
            notification = Notification.objects.get(id=id)
            notification.is_read = True
            notification.save()
            return JsonResponse({'status': 'success'})
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notification not found'}, status=404)
        


@api_view(["GET", "PATCH"])
def profile(request, username):
    try:
        account = Account.objects.get(USERNAME=username)
    except Account.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

 
    
    if request.method == "GET":
        serializer = AccountSerializer(account)
        return Response(serializer.data)

   
    if request.method == "PATCH":
        data = request.data.copy()

        
        if "PASSWORD" in data and data["PASSWORD"].strip() != "":
            data["PASSWORD"] = make_password(data["PASSWORD"])
        else:
            
            data.pop("PASSWORD", None)

        serializer = AccountSerializer(account, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["GET", "POST"])
def debtpayments(request):
    # -----------------------------
    # GET — return all payments
    # -----------------------------
    if request.method == "GET":
        payments = DebtPayments.objects.all().order_by("-created_at")
        serializer = DebtPaymentSerializer(payments, many=True)
        return Response(serializer.data)

    # -----------------------------
    # POST — create a new payment
    # -----------------------------
    elif request.method == "POST":
        serializer = DebtPaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
