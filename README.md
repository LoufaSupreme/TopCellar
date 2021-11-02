# Ontario Parks camping site database and web application.

## GOAL:
To improve on the current UI of the Ontario Parks online reservation website, namely by adding functionality to see all available campsite options at once, and to sort by more preferences.

## Background
Ontario parks runs an online reservation system for booking public campgrounds (https://reservations.ontarioparks.com/).  This website is handy for booking sites, however it can be very tedious to find a site that meets certain criteria and is available (especially when the provincial parks are busy).  The design of the website is such that you need to individually check each park, checking for available sites, instead of just filtering by criteria.  From looking at the network tab in the browser dev tools, it appears that the website works by making several API calls to a government-run server, however the API is not documented and the structure of the API responses is obscure (data is not labelled intuitivelly). 

This project makes the API calls that the ontarioparks website uses, and takes the responses to reverse-engineer a database of ontario campsites along with all of their associated properties.  It also grabs the latest availability of each site. The frontend then allows users to sort and view all the websites by a variety of criteria.

## Distinctiveness and Complexity (Harvard U Req't)
- Distinct: This project is unlike any other project in the CS50W 2020 project list.
- Complex: This project uses a series of async Javascript API calls to an external, undocumented API, then parses those responses and passes them to a Django backend server.  The Django server then parses them, loads them into a complicated database structure (consisting of 11+ models), sorts and filters the data, and passes back to the frontend.  Collecting the site data is very complex in of itself, since it requires multiple API calls to collect the various information associated with a site (location, category, attributes, fees, maps, equipment, etc.) Also, the info is not easily connected, as each of the aforementioned info is identified with an integer instead of by name. Thus connecting all the info to one site requires several nested fetch calls, and a SQL database structure with several many-to-many and one-to-many relationships. It also makes querying the database very complex (Q() queries in Django were helpful here).

## How it Works
- **loadDatabase.js:** Makes a series of clientside Fetch get calls to all of the relevant Ontario Campground API endpoints.  Each function is responsible for getting info corresponding to one of the Django Models associated with a campsite.  These include: Resource Location, Resource Category, Equipment, Attributes, Fee Categories, Rootmaps, Campmaps and the Sites themselves. Once the data is loaded into memory clientside, it is sent via a fetch post call to one of the Django API endpoints (outlined in the urls.py file) to load this data into the SQL database.  Most of these fetch sequences is 2 steps - once to get data from Ontario Parks, and once to send to the Django server.  However, the loadSites function is more complicated than the rest in that it must make a get request for every resource location that exists (each resource location contains a list of sites within it).  This requires an iterative fetch call, to collect all the sites from a resource location, send it to the Django database, and then move on to the next resource location.  As such, it is important that this process uses the async/await so that the next set of sites is sent to the backend server ONLY after the previous set completes.

- **app.js:** Clientside functionality to dynamically modify the DOM without refreshing the page. numResults() constructs a URL with query strings from the user input fields, and then sends it to the backend to determine how many sites match the query strings.  It then updates the DOM to reflect that.  getAvailability and setAvailability make asynchronous fetch calls to the Ontario Campground availability API endpoint for each site displayed on the screen, and displays the availability of those sites on the screen for today to 7 days from today.

- **models.py:** A model that represents a SQL database table is created for each aforementioned property fetched from the API endpoints in loadDatabase.js.  All models are independent from eachother except for Sites and SiteAttributes, which use several foreign keys and many to many relationships to link all the tables (models) together. This way all information associated with a campsite can be queried just by knowing the site ID.

- **urls.py:** Routing for the URLs.  Most paths are API calls to load the database or query sites that match a query string.

- **views.py:** All of the backend logic in the form of function views. Key functions include:
    - custom_filter: takes a list of target locations, site categories, equipment and attributes (from the user inputs) and queries the database for matches. Returns the list of matching sites.
    - parseURLQuery: creates and returns a custom object (dict) of target locations, categories, equipment and attributes from a URL query string.
    - get_num_results: sends a JSON response to the frontend that includes the number of matching sites from the custom_filter function.
    - get_dropdowns_fast: returns an updated list for each dropdown menu based on what is available to search.  e.g., if you filter all sites by only one location, then the dropdown list for available equipment to choose from updates based on the equipment that is available in that location only.
    - load_[property]: parses the response of a fetch call that was sent as a post request to the database (from loadDatabase.js) and loads it into the database.  If an item to be entered already exists in the database, it is either skipped or updated.  If it does not exist, it's added.  There is extensive logic in the load_sites function to link all the models to each site. 
    - index: renders index.html by sending a list of sites, dropdown options, etc.

- **layout.html:** Main html template that houses the navbar.

- **index.html:** Generates the body of the main page by displaying: a set of user inputs, a list of sites that match the criteria along with their properties, a pagination section that limits how many sites are displayed.

## File Structure
- camping (root)
    - camping (project)
        - static/camping
            - app.js
                - clientside Javascript code like getting the number of results of a query, and adding site availability
            - loadDatabase.js
                - Javascript code that calls the ontarioparks API to get data, and then passes to the Django server via fetch calls to load it into the SQL database
            - styles.css
                - CSS styling for the app
        - templates/camping
            - HTML for each page
        - admin, apps, models, views, urls.py
            - standard Django python files
    - ontario-parks-project
        - settings, urls.py
            - standard Django python files
    - manage.py
        - django manage.py file, used to run project
    - db.sqlite3
        - SQL database

### TO-DO:
#### General:
- [x] Reverse engineer existing Ontario Parks "API" so that site specific info for each site can be listed out.
- [x] Create Django models to map Ontario Parks JSON GET request response objects.
- [x] Create Javascript functions to asynchronously call API routes, and send to Django backend.
- [x] Create Django server-side function views to parse JSON responses and add results to SQLite3 db.
- [ ] Add pricing info?

#### Backend Design
##### Filter Views
- [x] Filter by Resource Location
- [x] Filter by Resource Category
- [x] Filter by Equipment
- [x] Filter by combinations of the above
- [ ] Filter by One attribute (feature)/value pair at a time
- [ ] Multiple attribute (feature)/value pair at a time   
- [ ] Filter by what's NOT there (i.e. all sites WITHOUT "adjacent to toilets"
 
##### Frontend Design:
- [ ] User Profile (create, edit, add photo, see all liked sites, see all comments)
- [x] Show all sites that meet search criteria
- [x] Link the above filter operations to front end via dynamic drop down menus
- [ ] Display weather (historical avg) for target days
- [ ] Show map of all resource locations and their access points + distance from Toronto (or custom address?)
- [ ] Dynamically fetch site photos when site is clicked on
- [ ] Add anchor to each site that links to Ontario Parks page for booking
- [x] Show site availability
###### User Activities
- [ ] Allow signed in users to like a site
- [ ] Allow signed in users to follow a site and get email notifications if it becomes available
- [ ] Allow signed in users to comment on sites
- [ ] Allow signed in users to like a comment

## How to Run
Navigate to root folder and enter python3 manage.py runserver into terminal
