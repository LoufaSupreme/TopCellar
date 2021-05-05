
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API ROUTES
    path('loadDatabase/resourceLocations', views.load_resource_locations, name="load_resource_locations"),
    path('loadDatabase/resourceCategories', views.load_resource_categories, name="load_resource_categories"),
    path('loadDatabase/equipment', views.load_equipment, name="load_equipment"),
    path('loadDatabase/attributes', views.load_attributes, name="load_attributes"),
    path('loadDatabase/feeCategories', views.load_fee_categories, name='load_fee_categories'), 
    path('loadDatabase/rootmaps', views.load_rootmaps, name='load_rootmaps'),
    path('loadDatabase/sites', views.load_sites, name='load_sites'),
    path('getNumResults', views.get_num_results, name='get_num_results')
]
