from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class ResourceLocation(models.Model):
    resource_location_id = models.BigIntegerField()
    short_name = models.CharField(max_length=24, blank=True, null=True)
    full_name = models.CharField(max_length=64, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    email = models.CharField(max_length=64, blank=True, null=True)
    website = models.CharField(max_length=300, blank=True, null=True)
    driving_directions = models.TextField(blank=True, null=True)
    gps_coords = models.CharField(max_length=64, blank=True, null=True)
    street_address = models.CharField(max_length=24, blank=True, null=True)
    city = models.CharField(max_length=48, blank=True, null=True)
    region = models.CharField(max_length=24, blank=True, null=True)
    postal = models.CharField(max_length=12, blank=True, null=True)
    country = models.CharField(max_length=24, blank=True, null=True)
    phone_num = models.CharField(max_length=24, blank=True, null=True)

    def __str__(self):
        return f"{self.resource_location_id}:{self.short_name}"


class ResourceCategory(models.Model):
    resource_category_id = models.BigIntegerField()
    version_id = models.BigIntegerField(blank=True)
    is_disabled = models.CharField(max_length=24, blank=True, null=True)
    name = models.CharField(max_length=48, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    resource_type = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.resource_category_id}:{self.name}"


class Equipment(models.Model):
    equipment_category_id = models.IntegerField()
    order = models.IntegerField(blank=True, null=True)
    is_active = models.CharField(max_length=24, blank=True, null=True)
    name = models.CharField(max_length=48, blank=True, null=True)

    def __str__(self):
        return f"{self.equipment_category_id}:{self.name}"


class Attribute(models.Model):
    attribute_definition_id = models.IntegerField()
    main_name = models.CharField(max_length=48, blank=True, null=True)
    version_id = models.BigIntegerField(blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)
    is_disabled = models.BooleanField(default=False)
    min_value = models.BigIntegerField(null=True, default=None)
    max_value = models.BigIntegerField(null=True, default=None)
    # if attribute is a category of several sub attributes (e.g. "privacy" then it needs the below fields for the subattribute info):
    subclass_name = models.CharField(max_length=48, null=True, default=None)
    subclass_enum = models.IntegerField(null=True, default=None)
    subclass_order = models.IntegerField(null=True, default=None)
    subclass_is_active = models.BooleanField(null=True, default=None)

    def __str__(self):
        return f"{self.attribute_definition_id}: {self.main_name}, Subclass: {self.subclass_name}"


class FeeCategory(models.Model):
    fee_category_id = models.IntegerField()
    version_id = models.BigIntegerField(blank=True, null=True)
    name = models.CharField(max_length=48, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_disabled = models.BooleanField(default=False)
    order = models.IntegerField(blank=True, null=True)
    visibility = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.fee_category_id}:{self.name}"


class Rootmap(models.Model):
    map_id = models.BigIntegerField()
    name = models.CharField(max_length=48, blank=True, null=True)
    resource_location = models.ForeignKey(ResourceLocation, on_delete=models.CASCADE, blank=True, null=True, related_name='rootmap')
    resource_categories = models.ManyToManyField(ResourceCategory, blank=True, related_name='rootmap')

    def __str__(self):
        return f"{self.map_id}:{self.name}"


class Site(models.Model):
    resource_id = models.BigIntegerField()
    version_id = models.BigIntegerField(blank=True, null=True)
    version_date = models.CharField(max_length=48, blank=True, null=True)
    is_disabled = models.BooleanField(default=False)
    resource_location = models.ForeignKey(ResourceLocation, on_delete=models.CASCADE, blank=True, null=True, related_name='site')
    resource_category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, blank=True, null=True, related_name='site')
    fee_category = models.ForeignKey(FeeCategory, on_delete=models.CASCADE, blank=True, null=True, related_name='site')
    date_schedule_id = models.BigIntegerField(blank=True, null=True)
    name = models.CharField(max_length=48, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)
    max_stay = models.IntegerField(blank=True, null=True)
    min_capacity = models.IntegerField(blank=True, null=True)
    max_capacity = models.IntegerField(blank=True, null=True)
    allowed_equipment = models.ManyToManyField(Equipment, blank=True, related_name='site')

    def __str__(self):
        return f"{self.resource_id} - {self.resource_category.name} {self.name} in {self.resource_location.short_name}"


# these are the individual attributes for each site.  I need this so I can store the key:value pair of attribute sites (i.e. Quality = Good for one site, but Quality = Bad for another)
class SiteAttribute(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='site_attributes')
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE, related_name='site_attributes')
    value = models.CharField(max_length=24, blank=True, null=True)

    def __str__(self):
        return f"Site Specific Attribute for site {self.site.name} in {self.site.resource_location.short_name} - {self.attribute.attribute_definition_id}: {self.attribute.main_name}, Subclass: {self.attribute.subclass_name}, Value: {self.value}"




