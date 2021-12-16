# TopCellar
Secure storage of your sales initiatives, in a cool environment.
Copyright Davis Innovations Inc.

## PROBLEM STATEMENT
Tracking sales opportunities across time can be challenging, especially for sales professionals that work in the field or within an industry with long sales cycles. Often, new opportunities to sell product or help a customer arise while the salesman is away from their desk (e.g. at an on-site sales call, driving, etc).  Sometimes a minor sale several months ago suddenly develops into a larger opportunity, and the customer expects you to remember everything that was discussed/evaluated/decided at the initial onset.

The salesman needs to keep track of what's been happening in his territory.  This often takes the form of impromptu notes written on scraps of paper in his car, random photos snapped with his cellphone, a half-assed attempt to file emails in Outlook, or a multitude of half-completed excel spreadsheets across several folders and devices. In short, a mess.

## OBJECTIVE
This app aims to help address the common sales problem of tracking sales activity by providing a persistent, easy to use, secure and accessible centralized database for all sales "events" (phonecalls, new opportunities, new ideas, failed initiatives, photos, roledex of customers and contacts, etc).  It will also act as a hub to track KPIs across time (opportuntities generated, conversion rate, new customers engaged/clinched, etc).

## Distinctiveness and Complexity

#### Distinctiveness:
This application differs from any CS50W project in that it generates all (nearly) of the HTML dynamically via Javascript functions. The Django backend acts as an API, serving the frontend data that can then be crafted into a user interface. All of the HTML is generated in the functional programming style, with (almost) no global variables (except for global state).

It is also different conceptually.  It is not an e-commerce or social networking site.  Instead, it is a sales tool used to track sales activity,

#### Complexity:
This app supports a wide range of interactivity, including:
 - register
 - login
 - creating sales entries
 - editing sales entries
 - deleting sales entries
 - marking entries as flagged
 - changing the status of an entry
 - sorting entries by multiple criteria and in multiple directions
 - filtering entries by multiple criteria (with options to only show entries that meet **all** the criteria, or to only show entries that meet **any** of the criteria)
 - ability to add multiple "tags" which can be added or deleted
 - automatic creation of "customer" or "contact" instances during entry creation/editing of an entry that references them (e.g., if entering a sales entry for a customer that doesn't exist yet, the user will be automatically prompted to see if they'd like to create that customer in the database. If they select yes, it will be carried out in the background)
 - creating contacts
 - editing contacts
 - deleting contacts
 - dynamic formatting of phone number inputs
 - dynamic searching/filtering of entries and contacts (based on one or multiple inputted search words) and dynamic highlighting of those words in the results

## How To Run
Navigate to the app's root folder "TopCellar" and enter python3 manage.py runserver into the terminal.

## How it Works
Django models are outlined in models.py, which describe the main classes of objects in the app.  Entries, which represent a sales entry input by the user to capture sales activity, can be linked via foreign keys or many-to-many relationships to Customer and Contact models, which represent a company and a person, respectively. An Entry can also be linked to a Tag, which is a keyword used to help sort entries. Customers are also linked to Tags, as well as Addresses which, predictably, store the addresses of the company. Contacts can also be linked to Customers (i.e. their place of work).  In this way, a sales entry can be connected to tags, customers, contacts and addresses.  There are also models outlined for User and Profile, but these are not yet fleshed out.

The purpose of the Django backend is to act as an API to provide and interface to the Javascript frontend. The views.py file outlines the functions it can do, such as creating, modifying, or deleting any of the above models, serializing one or many instances of a model and sending as JSON, registering a new user and logging in/authenticating a new user.  Only 3 server-rendered html pages are sent from the backend: login, register and index (which extends the layout.html template).  The rest is handled by dynamic Javascript. These views are accessed via the routes outlined in urls.py.

The frontend is created by two JS files: api.js and client.js. The api.js file houses any functions that make fetch API calls to the Django backend to send or retrieve data.  Those functions are called by other functions in the client.js file, which is responsible for generating and displaying all the dynamic HTML, and managing all user interactions.  Interaction such as clicks or key inputs are most often handled by event delegation - checking the target of the input and passing it to the relevant function for further processing. In this way, the application acts primarily as a SPA (single page app), with a single global variable ('store') to manage the state of the app.  The store variable is also what stores any information returned from the API calls (such as lists of entry data, etc).

Styling is handled by two CSS files: style.css and resets.css.  The resets.css file contains several common and helpful resets to make further styling more predictable.  The main style.css file is responsible for styling of all the components on the page.  It makes good use of CSS variables and utility classes to aid in this. 

## TODO
##### Landing Page
- [ ] 

##### Registration Page
- [ ] 

##### Welcome Tutorial Page
- [ ] 

##### Login Page
- [ ] 

##### Sales Entry Page
- [x] When adding an entry with a customer or contact that doesn't exist, prompt user if they'd like to create a new one
- [ ] Add frontend checks for required fields (create, edit)
- [x] Add backend checks for required fields (create, edit)
- [ ] Allow uploading pictures when creating or editing an entry
- [x] Implement search bar to filter entries
- [x] Show dynamic dropdown of available choices when typing in input field
- [x] Allow user to edit existing entry in place
- [x] Allow user to delete existing entry 
- [x] Allow user to edit existing entries
- [x] Allow user to flag existing entries
- [x] Allow user to change status of existing entries
- [ ] Display warning before deleting entry
- [x] Implement custom filtering of entries by adding tags (matching ANY criteria)
- [x] Implement custom filtering (matching ALL criteria)
- [ ] Allow user to save custom filters for later date
- [x] Implement sorting of entries by at least one criteria.  
- [ ] Allow sorting preference to be saved in user preferences each time
- [ ] Display user friendly error message if any console error
- [ ] Display user friendly success message if task completed successfully
- [ ] 
- [ ] 

##### Roledex Page
- [ ] Display all customers (companies)
- [x] Display all contacts
- [x] Search contacts with search bar
- [x] Ability to create new contacts
- [x] Ability to delete contacts
- [x] Ability to edit existing contacts
- [ ] Automatically create new customers if a contact is associated with a customer that doesn't yet exist
- [ ] 

##### KPIs Page
- [ ] Show User's profile info (picture, name, email, date joined, company)
- [ ] Ability to print page?
- [ ] Ability to export as excel
- [ ]
- [ ]
- [ ]
- [ ]
- [ ]

##### User Preferences Page
- [ ] Custom filters
- [ ] Chosen theme
- [ ] Profile picture and info
- [ ] Sorting criteria for entries, customers and contacts
- [ ] 
- [ ] 


##### Bonus
- [ ] Create alternative theme 1
- [ ] Create alternative theme 2
- [ ] Create alternative theme 3
- [ ] Allow user to change theme in tutorial page and preferences page
- [ ] 
- [ ] 
- [ ] 
- [ ] 

