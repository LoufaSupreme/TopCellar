# Ontario Parks camping site database and web application.

## GOAL:
To improve on the current UI of the Ontario Parks online reservation website, namely by adding functionality to see all available campsite options at once, and to sort by more preferences.

### TO-DO:
#### General:
- [x] Reverse engineer existing Ontario Parks "API" so that site specific info for each site can be listed out.
- [x] Create Django models to map Ontario Parks JSON GET request response objects.
- [x] Create Javascript functions to asynchronously call API routes, and send to Django backend.
- [x] Create Django server-side function views to parse JSON responses and add results to SQLite3 db.
- [] Add pricing info?

#### Backend Design
##### Filter Views
- [x] Filter by One attribute/value pair at a time
- [] Multiple attribute/value pair at a time   
- [] Filter by what's NOT there (i.e. all sites WITHOUT "adjacent to toilets"
- [] Filter by Resource Location
- [] Filter by Resource Category
- [] Filter by Equipment
 
##### Frontend Design:
- [] User Profile (create, edit, add photo, see all liked sites, see all comments)
- [] Show all sites that meet search criteria
- [] Link the above filter operations to front end via dynamic drop down menus
- [] Display weather (historical avg) for target days
- [] Show map of all resource locations and their access points + distance from Toronto (or custom address?)
- [] Dynamically fetch site photos when site is clicked on
- [] Add anchor to each site that links to Ontario Parks page for booking
###### User Activities
- [] Allow signed in users to like a site
- [] Allow signed in users to follow a site and get email notifications if it becomes available
- [] Allow signed in users to comment on sites
- [] Allow signed in users to like a comment


