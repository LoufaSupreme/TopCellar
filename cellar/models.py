from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import EmailField, PositiveBigIntegerField, PositiveIntegerField, related
from django.utils import timezone


class User(AbstractUser):
    pass


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    def __str__(self):
        return f'{self.user.username} Profile' 


class Address(models.Model):
    street_addr_1 = models.CharField(max_length=255)
    street_addr_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255)
    province = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=7)
    country = models.CharField(max_length=128, default="Canada")

    def __str__(self):
        return f'{self.street_addr_1}, {self.street_addr_2}, {self.city}, {self.province}' 
    
    def serialize(self):
        return {
            "id": self.id,
            "street_addr_1": self.street_addr_1,
            "street_addr_2": self.street_addr_2,
            "city": self.city,
            "province": self.province,
            "postal_code": self.postal_code,
            "country": self.country
        }


# descriptive words that act as optional parameters to sort data by
class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f'{self.name}' 

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
        }


class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=255)
    address = models.ForeignKey(Address, on_delete=models.PROTECT, null=True, blank=True, related_name='customers')
    industry = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name="customers")

    def __str__(self):
        return f'{self.name}' 

    def serialize(self):
        serialized = {
            "id": self.id,
            "user": self.user.id,
            "name": self.name,
            "address": None,
            "industry": self.industry,
            "notes": self.notes,
            "tags": [tag.name for tag in self.tags.all()]
        }

        if self.address != None:
            serialized['address'] = {
                "street_addr_1": self.address.street_addr_1,
                "street_addr_2": self.address.street_addr_2,
                "city": self.address.city,
                "province": self.address.province,
                "postal_code": self.address.postal_code,
                "country": self.address.country
            }

        return serialized


class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=55)
    last_name = models.CharField(max_length=55, null=True, blank=True)
    position = models.CharField(max_length=155, null=True, blank=True)
    email = EmailField(max_length=254, null=True, blank=True)
    phone_cell = PositiveBigIntegerField(null=True, blank=True)
    phone_office = PositiveBigIntegerField(null=True, blank=True)
    company = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.PROTECT, related_name='contacts')
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.company})' 

    def serialize(self):
        serialized = {
            "id": self.id,
            "user": self.user.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "name": f'{self.first_name}',
            "email": self.email,
            "phone_cell": self.phone_cell,
            "phone_office": self.phone_office,
            "company": None,
            "notes": self.notes,
        }

        if self.company != None:
            serialized['company'] = self.company.name

        if self.last_name != None:
            serialized['name'] = f'{self.first_name} {self.last_name}'

        return serialized


class Entry(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    description = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True, related_name='entries')
    contacts = models.ManyToManyField(Contact, blank=True, related_name='entries')
    rank = models.PositiveIntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    tags = models.ManyToManyField(Tag, blank=True, related_name="entries")

    def __str__(self):
        return f'{self.id} - {self.description[0:10]}...({self.author.username})'

    def serialize(self):
        
        serialized = {
            "id": self.id,
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "email": self.author.email
            },
            "description": self.description,
            "timestamp": {
                "full": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
                "year": self.timestamp.year,
                "month": self.timestamp.month,
                "day": self.timestamp.day,
                "hour": self.timestamp.hour,
                "minute": self.timestamp.minute,
                "second": self.timestamp.second,
            },
            "customer": None,
            "contacts": [{"id": contact.id, "first_name": contact.first_name, "last_name": contact.last_name} for contact in self.contacts.all()],
            "rank": self.rank,
            "completed": self.completed,
            "archived": self.archived,
            "tags": [tag.name for tag in self.tags.all()],
        }

        if self.customer != None:
            serialized['customer'] = {
                "id": self.customer.id,
                "name": self.customer.name
            }

        return serialized;


