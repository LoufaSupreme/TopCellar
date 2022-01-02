from django.urls import path
from . import views

# for images:
from django.conf.urls.static import static
from django.conf import settings


""" naming the app like below is good for organizing when there's multiple apps in the same proj.  You must 
use url 'app_name:view_name' format in html pages and views to access it properly"""
app_name = "cellar"


urlpatterns = [
    path('', views.index, name='index'),
    path('rolodex', views.rolodex, name='rolodex'),
    path('login', views.login_view, name='login'),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API ROUTES
    path('api/allEntries/', views.getEntries, name='allEntries'),
    path('api/allContacts/', views.getContacts, name='allContacts'),
    path('api/allCustomers/', views.getCustomers, name='allCustomers'),
    path('api/allTags/', views.getTags, name='allTags'),
    path('api/currentUser/', views.getUser, name='getUser'),
    path('api/entry/<str:pk>', views.entryDetail, name='entryDetail'),
    path('api/contact/<str:pk>', views.contactDetail, name='contactDetail'),
    path('api/customer/<str:pk>', views.customerDetail, name='customerDetail'),
    path('api/tag/<str:pk>', views.tagDetail, name='tagDetail'),
    path('api/new_entry/', views.new_entry, name='new_entry'),
    path('api/new_customer/', views.new_customer, name='new_customer'),
    path('api/new_contact/', views.new_contact, name='new_contact'),
    path('api/addFiles/<str:pk>', views.addFiles, name='addFiles'),

    # KPI ROUTES (also API routes, but for KPI info):
    path('kpi/entry_value/', views.kpi_entry_value, name='kpi_entry_value'),

]

# for images:
urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)