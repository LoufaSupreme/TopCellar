from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
import json
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist

from .models import *


def index(request):

    if request.method == 'GET':
        # target_locs = []
        # target_cat = []
        # target_equip = []
        # target_attr = 'all'
        
        # try:
        #     # get the search query values
        #     locs = request.GET.getlist('res-loc-dd')
        #     cat = request.GET.getlist('res-cat-dd')
        #     equip = request.GET.getlist('equip-dd')
        #     attr = request.GET.getlist('attr-dd')

            # # create query string:
            # query = ''
            # query += f'res-cat-dd={cat}&'
            # query += f'equip-dd={equip}&'
            # for loc in locs:
            #     query += f'res-loc-dd={loc}&'
            # query += f'attr-dd={attr}'

        #     target_locs = []
        #     for loc in locs:  
        #         target_loc = ResourceLocation.objects.get(full_name=loc)
        #         target_locs.append(target_loc)

        #     if cat != 'all':
        #         target_cat = ResourceCategory.objects.get(name=cat)
        #     else:
        #         target_cat = 'all'
        #     if equip != 'all':
        #         target_equip = Equipment.objects.get(name=equip)
        #     else:
        #         target_equip = 'all'
        #     if attr != 'all':
        #         target_attr = attr
        #     else:
        #         target_attr = 'all'
        # except:
        #     # if no search query parameters, set parameters to all:
        #     target_locs = []
        #     target_cat = []
        #     target_equip = []
        #     target_attr = 'all'

        # # filter sites by search parameters
        # sites = filter(target_locs, target_cat, target_equip, target_attr)

        query = parseURLQuery(request)
        sites = custom_filter(query['target_locs'], query['target_cats'], query['target_equips'], query['target_attr'])

        paginator = Paginator(sites, 10) # Show 10 sites per page.
        # get the current page in html query string.  If no current page in url, default to 1
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        # update the dropdown options to reflect new site list
        dropdown_options = get_dropdowns_fast(sites, query['target_locs'], query['target_cats'], query['target_equips'], query['target_attr'])

        # get list of relevant location IDs and map IDs for availability fetch request
        loc_id_list = []
        map_id_list = []
        for loc in query['target_locs']:
            loc_id_list.append(loc.resource_location_id)
            map_id_list.append(loc.rootmap.get().map_id)

        return render(request, "camping/index.html", {
                "page_obj": page_obj,
                "num_results": len(sites),
                'dd_opt': dropdown_options,
                'loc_id_list': loc_id_list,
                'map_id_list': map_id_list,
                'query': query['query_string']
        })
    

def custom_filter(target_locs, target_cats, target_equips, target_attr_name):
    print('Filtering:', target_locs,target_cats,target_equips,target_attr_name)
    # target_loc = ResourceLocation.objects.get(pk=a)
    # target_cat = ResourceCategory.objects.get(pk=b)
    # target_attr = Attribute.objects.get(pk=c)
    # target_equip = Equipment.objects.get(pk=d)

    loc_query = Q() # a Q object is used to do OR queries
    for loc in target_locs:
        loc_query |= Q(resource_location=loc)

    cat_query = Q() # a Q object is used to do OR queries
    for cat in target_cats:
        cat_query |= Q(resource_category=cat)

    equip_query = Q() # a Q object is used to do OR queries
    for e in target_equips:
        equip_query |= Q(allowed_equipment=e)

    # cat_query = Q()
    # if target_cat != 'all':
    #     cat_query = Q(resource_category=target_cat) 
    
    # equip_query = Q()
    # if target_equip != 'all':
    #     equip_query = Q(allowed_equipment=target_equip) 

    attr_query = Q()
    if target_attr_name != 'all':
        attr_query = Q(site_attributes__attribute__main_name=target_attr_name) 

    # filtering a Q() object separated by commas is an AND query
    sites = Site.objects.filter(loc_query, cat_query, equip_query, attr_query).distinct().order_by('resource_location')
    # sites = Site.objects.filter(loc_query, resource_category=target_cat, allowed_equipment=target_equ, site_attributes__attribute__main_name=target_attr_name,).order_by('name')
    print(f'Number of Matching Sites: {len(sites)}')
    return sites


def parseURLQuery(request):
    locs = request.GET.getlist('res-loc-dd')
    cats = request.GET.getlist('res-cat-dd')
    equips = request.GET.getlist('equip-dd')
    attr = request.GET.get('attr-dd')
    
    print(f'Query Info: {locs}, {cats}, {equips}, {attr}')

    # create query string:
    query = f'attr-dd={attr}&'
    for loc in locs:
        query += f'res-loc-dd={loc}&'
    for cat in cats:
        query += f'res-cat-dd={cat}&'
    for e in equips:
        query += f'equip-dd={e}&'
    
    target_locs = []
    for loc in locs:  
        target_loc = ResourceLocation.objects.get(full_name=loc)
        target_locs.append(target_loc)

    target_cats = []
    for cat in cats:  
        target_cat = ResourceCategory.objects.get(name=cat)
        target_cats.append(target_cat)


    target_equips = []
    for equip in equips:  
        target_equip = Equipment.objects.get(name=equip)
        target_equips.append(target_equip)

    if attr != None:
        target_attr = attr
    else:
        target_attr = 'all'

    query = {
        "query_string": query,
        "target_locs": target_locs,
        "target_cats": target_cats,
        "target_equips": target_equips,
        "target_attr": target_attr
    }

    return query
    

# gets the number of query results via JS fetch call
def get_num_results(request):
    
    query = parseURLQuery(request)
    sites = custom_filter(query['target_locs'], query['target_cats'], query['target_equips'], query['target_attr'])

    return JsonResponse({
        "num_results": sites.count()
    }, status=200)


def get_dropdowns_fast(sites, target_locs, target_cat, target_equip, target_attr):
    current_dropdowns = {}
    query_name = f'{target_locs}, {target_cat}, {target_equip}, {target_attr}'
    
    """
    Create a new 'current' InUseOptions object to store the relevant
    dropdown options for this list of sites, if it doesn't already exist.
    """
    try:
        current_dropdowns = InUseOptions.objects.get(name=query_name)
        print('Query exists in database - getting query results.')
    except:
        print('Query is new - making new InUseOptions object.')
        current_dropdowns = InUseOptions.objects.create(name=query_name)
    
        # get a list of all possible Attributes that have distinct main_names
        # in format {'main_name': 'Attribute.main_name'}
        all_unique_attrs = Attribute.objects.values('main_name').distinct()
        
        # further filter the sites list to figure out which of the unique attributes
        # are actually represented in the list of sites.  Add them to the InUseOptions obj.
        for attr in all_unique_attrs:
            x = sites.filter(site_attributes__attribute__main_name=attr['main_name'])
            if len(x) > 0:
                current_dropdowns.attributes.add(Attribute.objects.filter(main_name=attr['main_name']).first())
        
        # do same for other InUseOptions fields:
        for loc in ResourceLocation.objects.all():
            x = sites.filter(resource_location=loc)
            if len(x) > 0:
                current_dropdowns.resource_locations.add(loc)
        
        for cat in ResourceCategory.objects.all():
            x = sites.filter(resource_category=cat)
            if len(x) > 0:
                current_dropdowns.resource_categories.add(cat)
        
        for equip in Equipment.objects.all():
            x = sites.filter(allowed_equipment=equip)
            if len(x) > 0:
                current_dropdowns.equipment.add(equip)

    return current_dropdowns


def load_resource_locations(request):
    if request.method == 'POST':
        print('loading resource locations into db.')
        data = json.loads(request.body)
        all_resource_locations = data.get('allResourceLocations')

        for res_loc in all_resource_locations:
            resource_location_id = res_loc['resourceLocationId']
            short_name = res_loc['localizedValues'][0]['shortName']
            full_name = res_loc['localizedValues'][0]['fullName']
            description = res_loc['localizedValues'][0]['description']
            driving_directions = res_loc['localizedValues'][0]['drivingDirections']
            email = res_loc['email']
            website = res_loc['website']
            gps_coords = res_loc['gpsCoordinates']
            street_address = res_loc['streetAddress']
            city = res_loc['city']
            region = res_loc['region']
            postal = res_loc['regionCode']
            country = res_loc['country']
            phone_num = res_loc['phoneNumber']

            # check if resource location already exists in database
            all_reslocs = ResourceLocation.objects.all()
            if resource_location_id in [resloc.resource_location_id for resloc in all_reslocs]:
                print(f'Resource Location {resource_location_id}:{short_name} already exists in db.')
                continue
            else:   # if not, then add it to database
                print(f'Resource Location {resource_location_id}:{short_name} is new; adding it to database now.')
                new_resource_location = ResourceLocation.objects.create(
                    resource_location_id = resource_location_id,
                    short_name = short_name,
                    full_name = full_name,
                    description = description,
                    driving_directions = driving_directions,
                    email = email,
                    website = website, 
                    gps_coords = gps_coords, 
                    street_address = street_address, 
                    city = city,
                    region = region, 
                    postal = postal,
                    country = country,
                    phone_num = phone_num
                )
        return HttpResponseRedirect(reverse("index"))
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def load_resource_categories(request):
    if request.method == 'POST':
        print('Loading resource categories into db.')
        data = json.loads(request.body)
        all_resource_categories = data.get('allResourceCategories')

        for res_cat in all_resource_categories:
            resource_category_id = res_cat['resourceCategoryId']
            version_id = res_cat['versionId']
            is_disabled = res_cat['isDisabled']
            name = res_cat['localizedValues'][0]['name']
            description = res_cat['localizedValues'][0]['description']
            resource_type = res_cat['resourceType']

            # check if resource category already exists in database
            all_rescats = ResourceCategory.objects.all()
            if resource_category_id in [rescat.resource_category_id for rescat in all_rescats]:
                print(f'Already Exists: Resource Category {resource_category_id}:{name} already exists in db.')
                continue
            else:   # if not, then add it to database
                print(f'New: Resource Category {resource_category_id}:{name} is new; adding it to database now.')
                new_resource_category = ResourceCategory.objects.create(
                    resource_category_id = resource_category_id,
                    version_id = version_id,
                    is_disabled = is_disabled,
                    name = name,
                    description = description,
                    resource_type = resource_type
                )
        return HttpResponseRedirect(reverse("index"))
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def load_equipment(request):
    if request.method == 'POST':
        print('Loading equipment into db.')
        data = json.loads(request.body)
        all_equipment = data.get('allEquipment')

        # the equip "subcategories" are under a parent category called "equipment", which is the 0th and only list item...
        for equip in all_equipment[0]['subEquipmentCategories']:
            equipment_category_id = equip['subEquipmentCategoryId']
            order = equip['order']
            is_active = equip['isActive']
            name = equip['localizedValues'][0]['name']

            # check if equipment already exists in database
            all_equips = Equipment.objects.all()
            if equipment_category_id in [equip.equipment_category_id for equip in all_equips]:
                print(f'Already Exists: Equipment Category {equipment_category_id}:{name} already exists in db.')
                continue
            else:   # if not, then add it to database
                print(f'New: Equipment Category {equipment_category_id}:{name} is new; adding it to database now.')
                new_equipment_category = Equipment.objects.create(
                    equipment_category_id = equipment_category_id,
                    order = order,
                    is_active = is_active,
                    name = name
                )
        return HttpResponseRedirect(reverse("index"))
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def load_attributes(request):
    if request.method == 'POST':
        print('Loading attributes into db.')
        data = json.loads(request.body)
        all_attributes = data.get('allAttributes')
        # note that all_attributes is a dict in this case, not a list of dicts.

        for key, attr in all_attributes.items():
            attribute_definition_id = attr['attributeDefinitionId']
            main_name = attr['localizedValues'][0]['displayName']
            version_id = attr['versionId']
            order = attr['order']
            is_disabled = attr['isDisabled']
            # check if attribute has a 'minValue' key:
            if 'minValue' in attr:
                min_value = attr['minValue']
                max_value = attr['maxValue']
            # check if attribute has a "isMultiSelect" key:
            elif 'isMultiSelect' in attr:
                sub_attributes = attr['values']
                for sub_attr in sub_attributes:
                    subclass_name = sub_attr['localizedValues'][0]['displayName']
                    subclass_enum = sub_attr['enumValue']
                    subclass_order = sub_attr['order']
                    subclass_is_active = sub_attr['isActive']

                    # check if attribute already exists in database
                    try:
                        Attribute.objects.filter(attribute_definition_id=attribute_definition_id, subclass_name=subclass_name).get()
                        print(f'Already Exists: Attribute {attribute_definition_id}:{main_name}, Subclass:{subclass_name} already exists in db.')
                    except:
                        # create a new attribute:
                        print(f'New: Attribute {attribute_definition_id}:{main_name}, Subclass:{subclass_name} is new; adding it to database now.')
                        new_attribute = Attribute.objects.create(
                            attribute_definition_id = attribute_definition_id,
                            main_name = main_name,
                            version_id = version_id,
                            order = order,
                            is_disabled = is_disabled,
                            subclass_name = subclass_name,
                            subclass_enum = subclass_enum,
                            subclass_order = subclass_order,
                            subclass_is_active = subclass_is_active
                        )
            # if not a multiselect attribute, then just create a new attribute:
            else:
                all_db_attrs = Attribute.objects.all()
                if attribute_definition_id in [db_attr.attribute_definition_id for db_attr in all_db_attrs]:
                    print(f'Already Exists: Attribute {attribute_definition_id}:{main_name} already exists in db.')
                    continue
                else:
                    print(f'New: Attribute {attribute_definition_id}:{main_name} is new; adding it to database now.')        
                    new_attribute = Attribute.objects.create(
                        attribute_definition_id = attribute_definition_id,
                        main_name = main_name,
                        version_id = version_id,
                        order = order,
                        is_disabled = is_disabled,
                        min_value = min_value,
                        max_value = max_value
                    )
        return HttpResponseRedirect(reverse("index"))
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def load_fee_categories(request):
    if request.method == 'POST':
        print('Loading Fee Categories into db.')
        data = json.loads(request.body)
        all_fee_categories = data.get('allFeeCategories')

        for fee_cat in all_fee_categories:
            fee_category_id = fee_cat['rateCategoryId']
            version_id = fee_cat['versionId']
            name = fee_cat['localizedValues'][0]['name']
            description = fee_cat['localizedValues'][0]['description']
            is_disabled = fee_cat['isDisabled']
            order = fee_cat['order']
            visibility = fee_cat['visibility']

            all_db_feecats = FeeCategory.objects.all()
            if fee_category_id in [db_feecat.fee_category_id for db_feecat in all_db_feecats]:
                print(f'Fee Category {fee_category_id}:{name} already exists in db.')
                continue
            else:
                print(f'Fee Category {fee_category_id}:{name} is new; adding it to database now.')
                new_fee_category = FeeCategory.objects.create(
                    fee_category_id = fee_category_id,
                    version_id = version_id,
                    name = name,
                    description = description,
                    is_disabled = is_disabled,
                    order = order,
                    visibility = visibility
                )
        return HttpResponseRedirect(reverse("index"))
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def load_rootmaps(request):
    if request.method == 'POST':
        print('Loading Rootmaps into db.')
        data = json.loads(request.body)
        all_rootmaps = data.get('allRootmaps')

        for rootmap in all_rootmaps:
            map_id = rootmap['mapId']
            name = rootmap['resourceLocationLocalizedValues']['en-CA']
            try:
                resource_location = ResourceLocation.objects.get(resource_location_id = rootmap['resourceLocationId'])
            except:
                resource_location = None
            
            all_db_rootmaps = Rootmap.objects.all()
            if map_id in [db_rootmap.map_id for db_rootmap in all_db_rootmaps]:
                print(f'Already Exists: Rootmap {map_id}:{name} already exists in db.')
                continue
            else:
                print(f'New: Rootmap {map_id}:{name} is new; adding it to database now.')
                new_rootmap = Rootmap.objects.create(
                    map_id = map_id,
                    name = name,
                    resource_location = resource_location
                )
                if rootmap['resourceCategoryIds'] != None:
                    for rescat in rootmap['resourceCategoryIds']:
                        new_rootmap.resource_categories.add(
                            ResourceCategory.objects.get(resource_category_id = rescat)
                        )
        return HttpResponseRedirect(reverse("index"))
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def load_sites(request):
    if request.method == 'POST':
        # create a bucket to store any errors, so we can review them later:
        error_bucket = []

        print('Loading Sites into db.')
        data = json.loads(request.body)
        all_sites = data.get('allSites')
        
        # get all the sites already loaded into the database
        db_all_sites = Site.objects.all()
        # go through each site and check if its already loaded, if not, load it:
        for key, site in all_sites.items():
            name = site['localizedValues'][0]['name']
            # ignore sites with "deleted" in their name
            if 'Deleted' in name:
                continue
            # otherwise continue
            resource_id = site['resourceId']
            version_id = site['versionId']
            version_date = site['versionDate']
            is_disabled = site['isDisabled']
            date_schedule_id = site['dateScheduleId']
            description = site['localizedValues'][0]['description']
            order = site['order']
            max_stay = site['maxStay']
            min_capacity = site['minCapacity']
            max_capacity = site['maxCapacity']

            try:
                resource_location = ResourceLocation.objects.get(resource_location_id=site['resourceLocationId'])
            except Exception as e:
                print(e)
                error_bucket.append(f"{e}: Couldn't find ResLoc {site['resourceLocationId']} for site {resource_id}")
                resource_location = None
            try:
                resource_category = ResourceCategory.objects.get(resource_category_id=site['resourceCategoryId'])
            except Exception as e:
                print(e)
                error_bucket.append(f"{e}: Couldn't find ResCat {site['resourceCategoryId']} for site {resource_id}")
                resource_category = None
                       
            # check if site already in db. If it is, delete it so we can make it new. 
            try: 
                existing_site = Site.objects.get(resource_id=resource_id)
                print(f'OLD: {resource_id}:{name} found; updating.')
                existing_site.delete()
            except Site.DoesNotExist as e:
                print(e)

            # create new site: 
            if is_disabled == True:
                print(f'INACTIVE: Site {resource_id}:{name}; ignoring.')
            else:
                print(f'Adding {resource_id}:{name} to database now.')
                new_site = Site.objects.create(
                    resource_id = resource_id,
                    version_id = version_id,
                    version_date = version_date,
                    is_disabled = is_disabled,
                    resource_location = resource_location,
                    resource_category = resource_category,
                    # fee_category = fee_category,
                    date_schedule_id = date_schedule_id,
                    name = name,
                    description = description, 
                    order = order,
                    max_stay = max_stay,
                    min_capacity = min_capacity,
                    max_capacity = max_capacity
                )
                # add equipment to the site:
                if site['allowedEquipment'] != None:
                    for equip in site['allowedEquipment']:
                        all_site_equipment = new_site.allowed_equipment.all()
                        if equip['item2'] in [db_site_equip.equipment_category_id for db_site_equip in all_site_equipment]:
                            print(f'Already Exists: Site equipment {db_site_equip} already exists for site {new_site}')
                        try:
                            new_site.allowed_equipment.add(
                                Equipment.objects.get(equipment_category_id = equip['item2'])
                            )
                        except Exception as e:
                            print(e)
                            error_bucket.append(f"{e}: Site {resource_id}")

                # add site attributes:
                if site['definedAttributes'] != None:
                    for attr in site['definedAttributes']:
                        if attr['attributeVisibility'] == 0:
                            # check if the attribute has a "value" field or a "values" field
                            if 'values' in attr:
                                for value in attr['values']:
                                    try:
                                        # look up associated attribute:
                                        attribute = Attribute.objects.get(attribute_definition_id=attr['attributeDefinitionId'], subclass_enum=value)
                                        attr_val_name = attribute.subclass_name
                                    except Exception as e:
                                        print(e)
                                        error_bucket.append(f"{e}: Attribute {attr['attributeDefinitionId']}")
                                    # check if siteattribute already exists:
                                    try:
                                        existing_attr = SiteAttribute.objects.get(site=new_site, attribute=attribute, value=attr_val_name)
                                        print(f"Already Exists: SiteAttr {existing_attr} already exists; ignoring")
                                    except Exception as e:
                                        print(e)

                                    # if no query results for this siteattr then make a new one:
                                        try:
                                            new_site_attr = SiteAttribute.objects.create(
                                                site = new_site,
                                                attribute = attribute,
                                                value = attr_val_name
                                            )
                                            print(f'NEW: Adding new "enum" site specific attribute {attribute} for site {new_site}')
                                        except Exception as e:
                                            print(e)
                                
                            else: # if 'values' is not in attr (i.e. 'value' instead)
                                # create a new SiteAttribute object
                                try:
                                    attribute = Attribute.objects.get(attribute_definition_id=attr['attributeDefinitionId'])
                                except Exception as e:
                                    print(e)
                                attr_val = attr['value']
                                # check if siteattribute already exists:
                                if len(SiteAttribute.objects.filter(
                                    site = new_site,
                                    attribute = attribute,
                                    value = attr_val
                                )) == 0:
                                    # if no query results for this siteattr then make a new one:
                                    try:
                                        new_site_attr = SiteAttribute.objects.create(
                                            site = new_site,
                                            attribute = attribute,
                                            value = attr_val
                                        )
                                        print(f'NEW: Adding new site attribute {attribute} for {new_site}')
                                    except Exception as e:
                                        print(e)
        print('Finished.  Errors:', error_bucket)
        return JsonResponse({"success": f"Sites for Resource Location added."}, status=200)
    else:
        return JsonResponse({"error": "Post request required"}, status=400)

                
def load_camp_maps(request):
    if request.method == 'POST':
        print('Loading campground maps into db.')
        data = json.loads(request.body)
        all_camp_maps = data.get('allCampMaps')

        for camp_map in all_camp_maps:
            map_id = camp_map['mapId']
            name = camp_map['localizedValues'][0]['title']
            description = camp_map['localizedValues'][0]['description']
            is_disabled = camp_map['isDisabled']
            map_image_uid = camp_map['mapImageUid']
            try:
                rootmap = Rootmap.objects.get(map_id=camp_map['parentMaps'][0])
            except:
                rootmap = None
            try:
                resource_location = ResourceLocation.objects.get(resource_location_id = camp_map['resourceLocationId'])
            except:
                resource_location = None
            
            all_db_camp_maps = CampgroundMap.objects.all()
            if map_id in [db_camp_map.map_id for db_camp_map in all_db_camp_maps]:
                print(f'Already Exists: Camp Map {map_id}:{name} already exists in db.')
                continue
            else:
                print(f'NEW: Camp Map {map_id}:{name} is new; adding it to database now.')
                new_camp_map = CampgroundMap.objects.create(
                    map_id = map_id,
                    name = name,
                    description = description,
                    resource_location = resource_location,
                    is_disabled = is_disabled,
                    rootmap = rootmap,
                    map_image_uid = map_image_uid
                )
                if camp_map['mapResources'] != None:
                    print(f'Loading sites for Camp Map {map_id}:{name}')
                    for site in camp_map['mapResources']:
                        try:
                            new_camp_map.sites.add(Site.objects.get(resource_id = site['resourceId']))
                        except:
                            print(f'Campsite {site} not found. Ignoring it.')
                            continue
        return JsonResponse({"success": "Maps added"}, status=200)
    else:
        return JsonResponse({"error": "Post request required"}, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "camping/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "camping/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "camping/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "camping/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "camping/register.html")
