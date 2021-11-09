from django.urls import path
from . import views


""" naming the app like below is good for organizing when there's multiple apps in the same proj.  You must 
use url 'app_name:view_name' format in html pages and views to access it properly"""
app_name = "cellar"


urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    
    # API ROUTES
    path('api/allEntries/', views.getEntries, name='allEntries'),
    path('api/allContacts/', views.getContacts, name='allContacts'),
    path('api/allCustomers/', views.getCustomers, name='allCustomers'),
    path('api/entry/<str:pk>', views.entryDetail, name='entryDetail'),
    path('api/contact/<str:pk>', views.contactDetail, name='contactDetail'),
    path('api/customer/<str:pk>', views.customerDetail, name='customerDetail'),
]