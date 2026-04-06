from django.contrib import admin
from .models import (
    Category, Product, OrderProducts, OrderedItem, 
    Ewallet, Account, Notification, DebtPayments
)

# Optional: Inline view for items inside an Order
class OrderedItemInline(admin.TabularInline):
    model = OrderedItem
    extra = 1

@admin.register(OrderProducts)
class OrderProductsAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'cus_name', 'total_amt', 'status', 'order_date')
    list_filter = ('status', 'order_date')
    search_fields = ('cus_name', 'contact_num')
    inlines = [OrderedItemInline]

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'stock', 'selling_price', 'stock_status', 'is_active')
    list_filter = ('category', 'stock_status', 'is_active')
    search_fields = ('name',)

@admin.register(Ewallet)
class EwalletAdmin(admin.ModelAdmin):
    list_display = ('EWALL_APP', 'EWALL_TYPE', 'EWALL_ACC_NAME', 'EWALL_TOTAL', 'EWALL_DATE')
    list_filter = ('EWALL_APP', 'EWALL_TYPE')

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('USERNAME', 'FIRST_NAME', 'LAST_NAME', 'DATE_OF_BIRTH')
    search_fields = ('USERNAME', 'LAST_NAME')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('product', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')

@admin.register(DebtPayments)
class DebtPaymentsAdmin(admin.ModelAdmin):
    list_display = ('cus_name', 'amount_paid', 'date', 'order')
    search_fields = ('cus_name',)

# Simple registration for the remaining models
admin.site.register(Category)
admin.site.register(OrderedItem)