from django.urls import path
from . import views

urlpatterns = [
    # PRODUCTS
    path('add-product/', views.add_product, name='add_product'),
    path('products/', views.product_list, name='product_list'),
    path('products/<int:pk>/', views.product_detail),

    # CATEGORY
    path('categories/', views.CategoryListCreateView.as_view()),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view()),

    # EWALLET
    path('add-ewallet/', views.add_ewallet),
    path('ewallets/', views.ewallet_list),

    # AUTH
    path('account/', views.signup),
    path('login/', views.login_account),

    # ORDERS
    path('orders/', views.order_list),

    # MUST COME BEFORE update_order_status
    path("orders/<int:order_id>/items/", views.order_items),

    path('create-order/', views.create_order),
    path('orders/<int:pk>/', views.update_order_status),
    path('add-product/', views.add_product, name='add_product'),
    path('products/', views.product_list, name='product_list'),
    path('ordereditem/', views.orderitem_list, name='ordered_item'),
    path("analytics/", views.analytics, name="analytics"),
    path("profile/<str:username>/", views.profile),
    path('debtpayments/', views.debtpayments, name='debtpayments'),

    


    
    

   

   path('notifications/', views.notification_list, name='notification_list'),
   path('notifications/<int:id>/mark-read/', views.mark_notification_read, name='mark_notification_read'),
    


]
