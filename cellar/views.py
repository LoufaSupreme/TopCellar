from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
import json, datetime

from .models import User, Profile, Entry, Address, Customer, Contact, Tag



def index(request):

    user = request.user

    # trigger the register modal if "new_register" is set to True as a sesssion variable.
    # immediately pop it from the session upon redirect form the register view function.
    # https://stackoverflow.com/questions/29673537/django-redirect-with-context
    new_register = request.session.pop('new_register', False)
    if new_register:
        new_register = True
    else:
        new_register = False

    return render(request, "cellar/index.html", {
        "new_register": new_register,
        "user": user.username
    })

# API route
# send list of all entries for the user
def getEntries(request):
    user = request.user
    entries = Entry.objects.filter(author=user).all()

    return JsonResponse([entry.serialize() for entry in entries], safe=False)


# API route
# send details of just one entry
def entryDetail(request, pk):
    entry = Entry.objects.get(id=pk)

    return JsonResponse(entry.serialize(), safe=False)


# API route
# send list of all contacts for the user
def getContacts(request):
    user = request.user
    contacts = Contact.objects.filter(user=user).all()

    return JsonResponse([contact.serialize() for contact in contacts], safe=False)

# API route
# send details of just one contact
def contactDetail(request, pk):
    contact = Contact.objects.get(id=pk)

    return JsonResponse(contact.serialize(), safe=False)


# API route
# send list of all customers for the user
def getCustomers(request):
    user = request.user
    customers = Customer.objects.filter(user=user).all()

    return JsonResponse([customer.serialize() for customer in customers], safe=False)

# API route
# send details of just one customer
def customerDetail(request, pk):
    customer = Customer.objects.get(id=pk)

    return JsonResponse(customer.serialize(), safe=False)


# API route
# send list of all tags for the user
def getTags(request):
    user = request.user
    tags = Tag.objects.filter(user=user).all()

    return JsonResponse([tag.serialize() for tag in tags], safe=False)

# API Route
# send user info to frontend
def getUser(request):
    return JsonResponse(request.user.username, safe=False)


# API route
# create new entry
def newEntry(request):
    if request.method == 'POST':
        try:
            user = request.user
            data = json.loads(request.body)
            print(f'Creating new Entry for {user}: {data}')
            # get customer object:
            customer = data.get('customer')
            # try to get the exact customer (e.g. if they chose one of the dropdown options)
            try:
                customer = Customer.objects.get(id=customer['id'], name=customer['name'])
            except Customer.DoesNotExist:
                # something went wrong.  Frontend needs to send a request to make the customer first. 
                print('Customer does not exist.') 
                return JsonResponse({"error": "This customer doesn't exist."}, status=500)
            except Exception as e:
                print(f'Error: {e}')
                return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

            # get contact object for each contact. If it doesn't exist, create one:
            contact_names = data.get('contacts')
            contacts = []
            for c in contact_names:
                try:
                    contact = Contact.objects.get(id=c['id'], first_name=c['first_name'], last_name=c['last_name'])
                    contacts.append(contact)
                except Contact.DoesNotExist:
                    # something went wrong.  Frontend needs to send a request to make the contact first.  
                    return JsonResponse({"error": "This contact doesn't exist."}, status=500)
                except Exception as e:
                    return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

            # get date and make datetime object:
            entry_date = data.get('date')
            now = datetime.datetime.now()
            # use current time for the datetime instance.
            entry_date = datetime.datetime(entry_date["year"], entry_date["month"], entry_date["day"], now.hour, now.minute, now.second)

            # get description:
            descrip = data.get('description').strip()
            if descrip == "":
                raise ValidationError('Description is blank')

            # get tags. If the tag doesn't exist, create it:
            raw_tags = data.get('tags')
            tags = []
            for t in raw_tags:
                try:
                    tag = Tag.objects.get(name__iexact=t['name']) # case insensitive
                    tags.append(tag)
                except Tag.DoesNotExist:
                    tag = Tag(user=user, name=t['name'])
                    tag.save()
                    tags.append(tag)
                except Exception as e:
                    return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

            # create new entry:
            entry = Entry(
                author=user,
                customer=customer,
                description=descrip,
                timestamp=entry_date,
            )
            entry.save()

            # update the new entry to include the tags and contacts:
            for contact in contacts:
                entry.contacts.add(contact)
            for tag in tags:
                entry.tags.add(tag)

            entry.save()

            return JsonResponse(entry.serialize(), safe=False, status=201)
        except Exception as e:
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)
    else:
        return JsonResponse({"error": "Post method required"}, status=400)


# create new customer instance
def newCustomer(request):
    if request.method == 'POST':
        try:
            user = request.user
            data = json.loads(request.body)
            print(f'Creating new Customer for {user}: {data}')
            
            # get customer object:
            customer_name = data.get('name')
            # create new 
            new_customer = Customer(user=user, name=customer_name)
            new_customer.save()

            return JsonResponse(new_customer.serialize(), safe=False, status=201)
        except Exception as e:
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)
    else:
        return JsonResponse({"error": "Post method required"}, status=400)

# create new contact instance(s)
def newContacts(request):
    if request.method == 'POST':
        try:
            user = request.user
            contacts = json.loads(request.body)
            print(f'Creating new Contact(s) for {user}: {contacts}')

            # create new 
            new_contacts = []
            for c in contacts:
                new_contact = Contact(user=user, first_name=c['first_name'], last_name=c['last_name'])
                new_contact.save()
                new_contacts.append(new_contact)

            return JsonResponse([contact.serialize() for contact in new_contacts], safe=False, status=201)
        
        except Exception as e:
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)
    else:
        return JsonResponse({"error": "Post method required"}, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("cellar:index"))
        else:
            return render(request, "cellar/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "cellar/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("cellar:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "cellar/register.html", {
                "message": "Passwords must match."
            })
        
        if password == "" or username == "" or email == "":
            return render(request, "cellar/register.html", {
                "message": "Input the required fields."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            # assign profile to user
            profile = Profile(user=user)
            profile.save()
        except IntegrityError:
            return render(request, "cellar/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        
        # https://stackoverflow.com/questions/29673537/django-redirect-with-context
        # add "new_register" item to session, to trigger registration modal once.  It gets popped in the index function immediately. 
        request.session['new_register'] = True

        return HttpResponseRedirect(reverse("cellar:index"))
        
    else:
        return render(request, "cellar/register.html")
