from django.db import models
from django.utils import timezone
from datetime import date
from django.contrib.auth.hashers import make_password, check_password


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    stock = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_status = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'ATTN_Backend_product'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)


class OrderProducts(models.Model):
    order_id = models.AutoField(primary_key=True)
    status = models.CharField(max_length=50)
    cus_name = models.CharField(max_length=255, null=True, blank=True)
    contact_num = models.CharField(max_length=50, null=True, blank=True)
    total_amt = models.FloatField()
    due_date = models.DateField(null=True, blank=True)
    order_date = models.DateField(default=date.today)

    def __str__(self):
        return f"Order #{self.order_id} - {self.cus_name}"


class OrderedItem(models.Model):
    order = models.ForeignKey(OrderProducts, on_delete=models.CASCADE, related_name="items")
    product_name = models.CharField(max_length=255)
    qty = models.IntegerField()
    subtotal = models.FloatField()
    cost_price = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2)


class Ewallet(models.Model):
    EWALL_ID = models.BigAutoField(primary_key=True)
    EWALL_APP = models.CharField(max_length=255)
    EWALL_TYPE = models.CharField(max_length=255)
    EWALL_DATE = models.DateField(null=True, blank=True, default=date.today)
    EWALL_ACC_NAME = models.CharField(max_length=255, null=True, blank=True)
    EWAL_NUM = models.CharField(max_length=255, null=True, blank=True)
    EWALL_AMOUNT = models.BigIntegerField(null=True, blank=True)
    EWALL_FEE = models.BigIntegerField(null=True, blank=True)
    EWALL_TOTAL = models.BigIntegerField(null=True, blank=True)

    class Meta:
        db_table = 'ATTN_Backend_ewallet'


class Account(models.Model):
    USER_ID = models.BigAutoField(primary_key=True)

    FIRST_NAME = models.CharField(max_length=255)
    MIDDLE_NAME = models.CharField(max_length=255, null=True, blank=True)
    LAST_NAME = models.CharField(max_length=255)

    USERNAME = models.CharField(max_length=255, unique=True)
    DATE_OF_BIRTH = models.DateField(null=True, blank=True)

    PASSWORD = models.CharField(max_length=255)

    def set_password(self, raw_password):
        self.PASSWORD = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.PASSWORD)

    class Meta:
        db_table = 'ATTN_Backend_accounts'  

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('low_stock', 'Low Stock Warning'),
        ('out_of_stock', 'Out of Stock Alert'),
        ('restock_soon', 'Restock Soon'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    days_until_stockout = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class DebtPayments(models.Model):
    cus_name = models.CharField(max_length=255)  # Customer name
    order = models.ForeignKey(
        'orderproducts',               # Replace 'orderproducts' with your actual Order model name
        on_delete=models.CASCADE,      # Delete payments if the order is deleted
        related_name='payments'        # Allows reverse relation: order.payments.all()
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)  # Amount paid
    date = models.DateField()  # Date of payment
    created_at = models.DateTimeField(auto_now_add=True)  # Record creation timestamp

    def __str__(self):
        return f"{self.cus_name} - {self.amount_paid} on {self.date} (Order ID: {self.order.id})"

