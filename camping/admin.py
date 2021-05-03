from django.contrib import admin
from .models import User, ResourceLocation, ResourceCategory, Equipment, Attribute, FeeCategory, Site, SiteAttribute

# Register your models here.
admin.site.register(User)
admin.site.register(ResourceCategory)
admin.site.register(ResourceLocation)
admin.site.register(Equipment)
admin.site.register(Attribute)
admin.site.register(FeeCategory)

# There's too many of the below items for the admin page to load
# admin.site.register(Site)
# admin.site.register(SiteAttribute)
