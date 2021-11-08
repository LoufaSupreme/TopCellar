from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import EmailField, PositiveBigIntegerField, related
from django.utils import timezone


class User(AbstractUser):
    pass


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    def __str__(self):
        return f'{self.user.username} Profile' 


class Customer(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f'{self.name}' 


class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = EmailField(max_length=254, null=True, blank=True)
    phone_cell = PositiveBigIntegerField(null=True, blank=True)
    phone_office = PositiveBigIntegerField(null=True, blank=True)
    company = models.ForeignKey(Customer, blank=True, on_delete=models.PROTECT, related_name='contacts')

    def __str__(self):
        return f'{self.name} ({self.company})' 



class Entry(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    description = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True, related_name='entries')
    contact = models.ManyToManyField(Contact, blank=True, related_name='entries')
    priority = models.PositiveIntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    def __str__(self):
        return f'Entry {self.id} - {self.author.username}'

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "description": self.description,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "customer": self.customer.name,
            "contact": self.contact.name,
            "priority": self.priority,
            "completed": self.completed,
            "archived": self.archived,
            # "likes": [user.username for user in self.likes.all()],
            # "num_likes": self.likes.count()
        }


