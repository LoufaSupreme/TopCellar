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


class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f'{self.name}' 

    def serialize(self):
        return {
            "user": self.user.id,
            "name": self.name,
            "address": self.address,
            "industry": self.industry,
        }


class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=255)
    email = EmailField(max_length=254, null=True, blank=True)
    phone_cell = PositiveBigIntegerField(null=True, blank=True)
    phone_office = PositiveBigIntegerField(null=True, blank=True)
    company = models.ForeignKey(Customer, blank=True, on_delete=models.PROTECT, related_name='contacts')

    def __str__(self):
        return f'{self.name} ({self.company})' 

    def serialize(self):
        return {
            "user": self.user.id,
            "name": self.name,
            "email": self.email,
            "phone_cell": self.phone_cell,
            "phone_office": self.phone_office,
            "company": self.company.name,
        }



class Entry(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    description = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True, related_name='entries')
    contacts = models.ManyToManyField(Contact, blank=True, related_name='entries')
    rank = models.PositiveIntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    def __str__(self):
        return f'Entry {self.id} - {self.author.username}'

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
            "contacts": [{"id": contact.id, "name": contact.name} for contact in self.contacts.all()],
            "rank": self.rank,
            "completed": self.completed,
            "archived": self.archived,
            # "likes": [user.username for user in self.likes.all()],
            # "num_likes": self.likes.count()
        }
        if self.customer != None:
            serialized['customer'] = {
                "id": self.customer.id,
                "name": self.customer.name
            }

        return serialized;


