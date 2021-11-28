from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
import json, datetime
import traceback

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
        "user": user
    })

# API route
# send list of all entries for the user
def getEntries(request):
    user = request.user
    entries = Entry.objects.filter(author=user).all()

    return JsonResponse([entry.serialize() for entry in entries], safe=False)


# API route
# send details of just one entry or update one entry:
def entryDetail(request, pk):

    # if get request to request details:
    if request.method == 'GET':
        # get the entry associated with the pk (id)
        try:
            entry = Entry.objects.get(id=pk)
            return JsonResponse(entry.serialize(), safe=False)
        except Exception as e:
            print(f'Error: {e}')

    # if put request to update entry:
    elif request.method == 'PUT':
        try:
            entry = Entry.objects.filter(id=pk)
            entry_data = consolidateEntryData(request)
            contacts = entry_data['contacts'];
            tags = entry_data['tags']
            print(f'Updating Entry {pk}: {json.loads(request.body)}')

            # create new entry:
            entry.update(
                author=entry_data['user'],
                customer=entry_data['customer'],
                description=entry_data['description'],
                timestamp=entry_data['date'],
                rank=entry_data['rank'],
            )

            entry = Entry.objects.get(id=pk)
            entry.contacts.clear()
            entry.tags.clear()

            for contact in contacts:
                entry.contacts.add(contact)
            for tag in tags:
                entry.tags.add(tag)

            return JsonResponse(entry.serialize(), safe=False, status=201)
        except Exception as e:
            print(f'Error: {e}')
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)
    
    # 
    elif request.method == 'DELETE':
        try:
            entry = Entry.objects.get(id=pk)
            entry.delete()
            return JsonResponse({"success": f'Entry {pk} successfully deleted.'}, status=201)
        except Exception as e:
            print(f'Error: {e}')
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

    else:
        return JsonResponse({"error": "Unsupported HTTP method."}, status=400)



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


# handles checking and summarizing json data to create or update a post
# returns a dict
def consolidateEntryData(request):
    user = request.user
    data = json.loads(request.body)
    # get customer object:
    customer = data.get('customer')
    # try to get the exact customer (e.g. if they chose one of the dropdown options)
    customer = Customer.objects.get(id=customer['id'], name=customer['name'])

    # get contact object for each contact. If it doesn't exist, create one:
    contact_names = data.get('contacts')
    contacts = []
    for c in contact_names:
        print(c, c['id'], c['first_name'], c['last_name'])
        contact = Contact.objects.get(id=c['id'], first_name=c['first_name'], last_name=c['last_name'])
        contacts.append(contact)

    # get date and make datetime object:
    entry_date = data.get('date')
    now = datetime.datetime.now()
    # use current time for the datetime instance.
    entry_date = datetime.datetime(entry_date["year"], entry_date["month"], entry_date["day"], now.hour, now.minute, now.second)

    # get description:
    descrip = data.get('description').strip()
    if descrip == "":
        raise ValidationError('Description is blank')

    # get rank:
    rank = data.get('rank')
    if rank == '':
        rank = None

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
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc()
    
    entry_data = {
        'user': user,
        'customer': customer,
        'contacts': contacts,
        'description': descrip,
        'rank': rank,
        'date': entry_date,
        'tags': tags,
    }
    # print(entry_data)
    return entry_data


# API route
# create new entry
def newEntry(request):
    if request.method == 'POST':
        try:
            entry_data = consolidateEntryData(request)
            contacts = entry_data['contacts'];
            tags = entry_data['tags']
            print(f'Creating new Entry for {entry_data["user"]}: {json.loads(request.body)}')

            # create new entry:
            entry = Entry(
                author=entry_data['user'],
                customer=entry_data['customer'],
                description=entry_data['description'],
                timestamp=entry_data['date'],
                rank=entry_data['rank'],
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
            traceback.print_exc()
            print(f'{e.__class__.__name__}: {e}')
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
