from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
import json, datetime
import traceback

from .models import User, Profile, Entry, Address, Customer, Contact, Tag


@login_required
def index(request):

    user = request.user
    
    if not user.is_authenticated:
        return render(request, 'cellar/login.html')

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

@login_required
def rolodex(request):
    user = request.user
    return render(request, "cellar/rolodex.html", {
        "user": user
    })


# API route
# send list of all entries for the user
def getEntries(request):
    user = request.user
    entries = Entry.objects.filter(author=user).all().order_by('-timestamp')

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
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc()

    # if put request to update entry:
    elif request.method == 'PUT':
        try:
            # have to use filter here, so can call the update function later:
            entry = Entry.objects.filter(id=pk)
            entry_data = consolidateEntryData(request)
            contacts = entry_data['contacts']
            tags = entry_data['tags']
            
            print(f'Updating Entry {pk}: {json.loads(request.body)}')

            # update entry object:
            entry.update(
                author=entry_data['user'],
                customer=entry_data['customer'],
                description=entry_data['description'],
                timestamp=entry_data['timestamp'],
                date_edited=entry_data['date_edited'],
                date_completed=entry_data['date_completed'],
                date_archived=entry_data['date_archived'],
                date_flagged=entry_data['date_flagged'],
                rank=entry_data['rank'],
                flagged=entry_data['flagged'],
                archived=entry_data['archived'],
                completed=entry_data['completed'],
            )

            # clear any existing contacts or tags, and replace with the new ones:
            # need to do it this way because they are list elements
            entry = Entry.objects.get(id=pk)
            entry.contacts.clear()
            entry.tags.clear()

            for contact in contacts:
                entry.contacts.add(contact)
            for tag in tags:
                entry.tags.add(tag)

            return JsonResponse(entry.serialize(), safe=False, status=201)
        except Exception as e:
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc()
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)
    
    # 
    elif request.method == 'DELETE':
        try:
            entry = Entry.objects.get(id=pk)
            entry.delete()
            return JsonResponse({"success": f'Entry {pk} successfully deleted.'}, status=201)
        except Exception as e:
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc()

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
    # get details:
    if request.method == 'GET':
        print(f'Getting details for contact {pk}')
        try:
            contact = Contact.objects.get(id=pk)
            return JsonResponse(contact.serialize(), safe=False)
        except Exception as e:
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc()
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

    # edit contact
    elif request.method == 'PUT':
        print(f'Updating contact {pk}: {json.loads(request.body)}')
        try:
            # have to use filter here, so we can call the update method later:
            contact = Contact.objects.filter(id=pk)
            contact_data = consolidate_contact_data(request)
            contact.update(
                user=contact_data['user'],
                first_name=contact_data['first_name'],
                last_name=contact_data['last_name'],
                position=contact_data['position'],
                company=contact_data['company'],
                phone_cell=contact_data['phone_cell'],
                phone_office=contact_data['phone_office'],
                email=contact_data['email'],
                notes=contact_data['notes'],
            )
            
            # need to "get" contact so can use the serialize function
            contact = Contact.objects.get(id=pk);

            return JsonResponse(contact.serialize(), safe=False, status=201)

        except Exception as e:
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc() 
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

    # delete contact:
    elif request.method == 'DELETE':
        print(f'Deleting contact {pk}')
        try:
            contact = Contact.objects.get(id=pk)
            contact.delete()
            return JsonResponse({"success": f'Contact {pk} successfully deleted.'}, status=201)
        except Exception as e:
            print(f'{e.__class__.__name__}: {e}')
            traceback.print_exc()

            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)

    else:
        return JsonResponse({"error": "Unsupported HTTP method."}, status=400)


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

# helper function
# creates a datetime object from a json date:
def parse_JSONdate(date):
    if date != None:
        return datetime.datetime(date["year"], date["month"], date["day"], date["hour"], date["minute"], date["second"])
    else:
        return None


# handles checking and summarizing json data to create or update a post
# returns a dict
def consolidateEntryData(request):
    user = request.user
    data = json.loads(request.body)

    print(f'Consolidating Entry Data: {data}')

    # get customer object:
    customer = data.get('customer')
    # try to get the exact customer (e.g. if they chose one of the dropdown options)
    try:
        customer = Customer.objects.get(id=customer['id'], name=customer['name'])
    except:
        customer = None

    # get contact object for each contact.
    contact_names = data.get('contacts')
    contacts = []
    for c in contact_names:
        # print('Contact:', c)
        contact = Contact.objects.get(id=c['id'])
        contacts.append(contact)

    # get date and make datetime object:
    entry_date = parse_JSONdate(data.get('timestamp'))
    date_edited = parse_JSONdate(data.get('date_edited'))
    date_flagged = parse_JSONdate(data.get('date_flagged'))
    date_completed = parse_JSONdate(data.get('date_completed'))
    date_archived = parse_JSONdate(data.get('date_archived'))

    # entry_date = datetime.datetime(entry_date["year"], entry_date["month"], entry_date["day"], entry_date["hour"], entry_date["minute"], entry_date["second"])

    # get description:
    descrip = data.get('description').strip()
    if descrip == "":
        raise ValidationError('Description is blank')

    # get rank:
    rank = data.get('rank')
    if rank == '':
        rank = None

    flagged = data.get('flagged')
    archived = data.get('archived')
    completed = data.get('completed')

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
        'timestamp': entry_date,
        'flagged' : flagged, 
        'archived': archived,
        'completed': completed,
        'tags': tags,
        'date_edited': date_edited,
        'date_flagged': date_flagged,
        'date_completed': date_completed,
        'date_archived': date_archived,  
    }
    # print(entry_data)
    return entry_data


# API route
# create new entry
def new_entry(request):
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
                timestamp=entry_data['timestamp'],
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
def new_customer(request):
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
            traceback.print_exc()
            return JsonResponse({"error": f'{e.__class__.__name__}: {e}'}, status=500)
    else:
        return JsonResponse({"error": "Post method required"}, status=400)


def consolidate_contact_data(request):
    user = request.user
    data = json.loads(request.body)

    first_name = data.get('first_name')
    if first_name == '':
        raise ValidationError('First name cannot be blank.')
    
    last_name = data.get('last_name')
    position = data.get('position')
    email = data.get('email')
    phone_cell = data.get('phone_cell')
    phone_office = data.get('phone_office')
    notes = data.get('notes')

    company = data.get('company')
    if company != None:
        company = Customer.objects.get(id=company['id'], name=company['name'])

    contact_data = {
        'user': user,
        'first_name': first_name,
        'last_name': last_name,
        'position': position,
        'company': company,
        'email': email,
        'phone_cell': phone_cell,
        'phone_office': phone_office,
        'notes': notes,
    }

    return contact_data


# create new contact instance(s)
def new_contact(request):
    if request.method == 'POST':
        try:
            user = request.user
            contacts_data = json.loads(request.body)

            # if a list of new contacts was passed:
            if isinstance(contacts_data, list):
                print(f'Creating new Contact(s) (from list) for {user}: {contacts_data}')

                # create new 
                new_contacts = []
                for c in contacts_data:
                    new_contact = Contact(
                        user=user, 
                        first_name=c['first_name'], 
                        last_name=c['last_name']
                    )
                    new_contact.save()
                    new_contacts.append(new_contact)

                return JsonResponse([contact.serialize() for contact in new_contacts], safe=False, status=201)

            else:
                print(f'Creating new Contact instance for {user}: {contacts_data}')
                consolidated_data = consolidate_contact_data(request)
                contact = Contact(
                    user=consolidated_data['user'],
                    first_name=consolidated_data['first_name'],
                    last_name=consolidated_data['last_name'],
                    position=consolidated_data['position'],
                    company=consolidated_data['company'],
                    phone_cell=consolidated_data['phone_cell'],
                    phone_office=consolidated_data['phone_office'],
                    email=consolidated_data['email'],
                    notes=consolidated_data['notes'],
                )
                contact.save()

                return JsonResponse(contact.serialize(), safe=False, status=201)
        
        except Exception as e:
            traceback.print_exc()
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
