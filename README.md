# Ontario Parks camping site database and web application.

## GOAL:
To improve on the current UI of the Ontario Parks online reservation website, namely by adding functionality to see all available campsite options at once, and to sort by more preferences.

## Background
Ontario parks runs an online reservation system for booking public campgrounds (https://reservations.ontarioparks.com/).  This website is handy for booking sites, however it can be very tedious to find a site that meets certain criteria and is available (especially when the provincial parks are busy).  The design of the website is such that you need to individually check each park, checking for available sites, instead of just filtering by criteria.  From looking at the network tab in the browser dev tools, it appears that the website works by making several API calls to a government-run server, however the API is not documented and the structure of the API responses is obscure (data is not labelled intuitivelly). 

This project makes the API calls that the ontarioparks website uses, and takes the responses to reverse-engineer a database of ontario campsites along with all of their associated properties.  It also grabs the latest availability of each site. The frontend then allows users to sort and view all the websites by a variety of criteria.

## Distinctiveness and Complexity (Harvard U Req't)
- Distinct: This project is unlike any other project in the CS50W 2020 project list.
- Complex: This project uses a series of async Javascript API calls to an external, undocumented API, then parses those responses and passes them to a Django backend server.  The Django server then parses them, loads them into a complicated database structure (consisting of 11+ models), sorts and filters the data, and passes back to the frontend.  Collecting the site data is very complex in of itself, since it requires multiple API calls to collect the various information associated with a site (location, category, attributes, fees, maps, equipment, etc.) Also, the info is not easily connected, as each of the aforementioned info is identified with an integer instead of by name. Thus connecting all the info to one site requires several nested fetch calls, and a SQL database structure with several many-to-many and one-to-many relationships. It also makes querying the database very complex (Q() queries in Django were helpful here).

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
- [x] Filter by One attribute/value pair at a time
- [ ] Multiple attribute/value pair at a time   
- [ ] Filter by what's NOT there (i.e. all sites WITHOUT "adjacent to toilets"
- [ ] Filter by Resource Location
- [ ] Filter by Resource Category
- [ ] Filter by Equipment
 
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
