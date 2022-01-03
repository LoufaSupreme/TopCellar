# TopCellar
#### Opportunity Tracking for Sales Professionals
## Secure storage of your sales initiatives, in a cool environment.
##### Copyright Davis Innovations Inc.

## PROBLEM STATEMENT
Tracking sales opportunities across time can be challenging, especially for sales professionals that work in the field or within an industry with long sales cycles. Often, new opportunities to sell product or help a customer arise while the salesman is away from their desk (e.g. at an on-site sales call, driving, etc).  Sometimes a minor sale several months ago suddenly develops into a larger opportunity, and the customer expects you to remember everything that was discussed/evaluated/decided at the initial onset.

The salesman needs to keep track of what's been happening in his territory.  This often takes the form of impromptu notes written on scraps of paper in his car, random photos snapped with his cellphone, a half-assed attempt to file emails in Outlook, or a multitude of half-completed excel spreadsheets across several folders and devices. In short, a mess.

## OBJECTIVE
This app aims to help address the common sales problem of tracking sales activity by providing a persistent, easy to use, secure and accessible centralized database for all sales "events" (phonecalls, new opportunities, new ideas, failed initiatives, photos, roledex of customers and contacts, etc).  It will also act as a hub to track KPIs across time (opportuntities generated, conversion rate, new customers engaged/clinched, etc).

## How To Run
Navigate to the app's root folder "TopCellar" and enter 
    `python3 manage.py runserver` 
into the terminal.

## How it Works
Django models are outlined in models.py, which describe the main classes of objects in the app.  Entries, which represent a sales entry input by the user to capture sales activity, can be linked via foreign keys or many-to-many relationships to Customer and Contact models, which represent a company and a person, respectively. An Entry can also be linked to a Tag, which is a keyword used to help sort entries. Customers are also linked to Tags, as well as Addresses which, predictably, store the addresses of the company. Contacts can also be linked to Customers (i.e. their place of work).  In this way, a sales entry can be connected to tags, customers, contacts and addresses.  There are also models outlined for User and Profile, but these are not yet fleshed out.

The purpose of the Django backend is to act as an API to provide and interface to the Javascript frontend. The views.py file outlines the functions it can do, such as creating, modifying, or deleting any of the above models, serializing one or many instances of a model and sending as JSON, registering a new user and logging in/authenticating a new user.  Only 3 server-rendered html pages are sent from the backend: login, register and index (which extends the layout.html template).  The rest is handled by dynamic Javascript. These views are accessed via the routes outlined in urls.py.

The frontend is created by two JS files: api.js and client.js. The api.js file houses any functions that make fetch API calls to the Django backend to send or retrieve data.  Those functions are called by other functions in the client.js file, which is responsible for generating and displaying all the dynamic HTML, and managing all user interactions.  Interaction such as clicks or key inputs are most often handled by event delegation - checking the target of the input and passing it to the relevant function for further processing. In this way, the application acts primarily as a SPA (single page app), with a single global variable ('store') to manage the state of the app.  The store variable is also what stores any information returned from the API calls (such as lists of entry data, etc).

Styling is handled by two CSS files: style.css and resets.css.  The resets.css file contains several common and helpful resets to make further styling more predictable.  The main style.css file is responsible for styling of all the components on the page.  It makes good use of CSS variables and utility classes to aid in this. 

## TODO
### General
- [x] Add a favicon

### Landing Page
- [ ] 

### Registration Page
- [ ] Remove need to enter username - register via email instead

### Welcome Tutorial Page
- [ ] 

### Login Page
- [ ] Sign in via email instead of username
- [ ] Email for forgotten password
- [ ] 

### Sales Entry Page
- [x] When adding an entry with a customer or contact that doesn't exist, prompt user if they'd like to create a new one
- [x] Add frontend checks for required fields (create, edit)
- [x] Add backend checks for required fields (create, edit)
- [x] Allow uploading pictures when creating or editing an entry
- [ ] Allow deleting of pictures when in edit mode
- [ ] Expand pictures when clicked
- [ ] Present pictures in a carousel
- [x] Implement search bar to filter entries
- [x] Show dynamic dropdown of available choices when typing in input field
- [x] Allow user to edit existing entry in place
- [x] Allow user to delete existing entry 
- [x] Allow user to edit existing entries
- [x] Allow user to flag existing entries
- [x] Allow user to change status of existing entries
- [ ] Display warning before deleting entry
- [x] Display user friendly error message if any console error
- [x] Display user friendly success message if task completed successfully
- [x] Display dollar value on entries
- [x] Add likelihood of success values to entries
- [x] Auto calculate priority rank based on likelihood and dollar value
- [x] Display priority/rank on entries
- [ ] Allow suggestion dropdown list to be navigatable by arrow keys/enter
- [x] Make text in entry description wrap before increasing entry width
- [x] Show contact card when hovering over contact name
- [x] Allow tag deletion by clicking 'x' inside suggestion dropdown
- [ ] Make filter and sort buttons to show modals, instead of dropdowns. Have an indicator for when a filter or sort is active.
- [ ] Dynamically add tags to the store when they're created
- [ ] Separate page into "Active", "Complete", "Archived"
- [ ] Add large ? icon with message when no entries to display
- [ ] Replace background with nice gradient
- [ ] Simulate "enter" on all form inputs on submit to create tags if user forgot
- [ ] 
#### Filter Functionality
- [x] Implement custom filtering (matching ALL criteria)
- [x] Implement custom filtering of entries by adding tags (matching ANY criteria)
- [ ] Change filter date selection into a sliding range bar
- [ ] Allow user to save custom filters for later date
- [ ] Only allow one customer instance if filtering by "ALL"
- [ ] Change checkboxes to radio buttons if filtering by "ALL"
- [ ] Populate filter dropdown with available custom filters
- [ ] Build filter by adding criteria one by one
- [ ] Filter by date edited range
- [ ] Filter by date flagged range
- [ ] Easily remove all filters
- [ ] Filter by has pictures
- [ ] Fix issue where blank filter returns no results
- [ ] 
#### Sort Functionality
- [x] Implement sorting of entries by at least one criteria.  
- [ ] Allow sorting preference to be saved in user preferences each time
- [x] Sort by date created
- [x] Sort by customer name
- [x] Sort by flagged status
- [x] Sort by dollar amount
- [x] Sort by date completed
- [x] Sort by date archived
- [x] Sort by date edited
- [x] Sort by date flagged
- [ ] Add secondary sort criteria
- [x] Sort by rank/priority
- [ ] Easily remove all sorting criteria
- [ ] 

### Roledex Page
#### General
- [ ] Add large ? icon and message when no content to display
- [ ] Split page into Customers and Contacts display with buttons
- [ ] Use 3rd party API to lazy-load customer logos
- [ ] Use Google Maps API to map to customer locations
#### Customers Sub-page
- [ ] Display all customers (companies)
- [ ] Group contacts by company
- [ ] Group customers (companies) by tags
- [ ] Show customers on map
- [ ] Allow editing of customer details
- [ ] 
- [ ] 
#### Contacts Sub-page
- [x] Display all contacts
- [x] Search contacts with search bar
- [x] Ability to create new contacts
- [x] Ability to delete contacts
- [x] Ability to edit existing contacts
- [x] Automatically create new customers if a contact is associated with a customer that doesn't yet exist
- [x] Show customer notes on click or hover
- [ ] Use LinkedIn API (?) to get contact pictures?
- [ ]

### KPIs Page
- [ ] Show User's profile info (picture, name, email, date joined, company)
- [ ] Ability to print page?
- [ ] Export data to excel or CSV
- [ ] Tabulate total $ opportunities
- [ ] Tabulate conversion rate
- [ ] Graph # of opportunities over time
- [ ] Pie chart opportunities by customer
- [ ] Tabulate average close time
- [ ] Tabulate avg monthly opportunity generation rate
- [ ]
- [ ]
- [ ]

### User Preferences Page
- [ ] Custom filters
- [ ] Chosen theme
- [ ] Profile picture and info
- [ ] Sorting criteria for entries, customers and contacts
- [ ] Option to change email
- [ ] Option to change password
- [ ] 


### Bonus
- [ ] Create alternative theme 1
- [ ] Create alternative theme 2
- [ ] Create alternative theme 3
- [ ] Allow user to change theme in tutorial page and preferences page
- [ ] 
- [ ] 
- [ ] 
- [ ] 