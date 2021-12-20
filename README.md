# TopCellar
#### Opportunity Tracking for Sales Professionals
## Secure storage of your sales initiatives, in a cool environment.
##### Copyright Davis Innovations Inc.

## PROBLEM STATEMENT
Tracking sales opportunities across time can be challenging, especially for sales professionals that work in the field or within an industry with long sales cycles. Often, new opportunities to sell product or help a customer arise while the salesman is away from their desk (e.g. at an on-site sales call, driving, etc).  Sometimes a minor sale several months ago suddenly develops into a larger opportunity, and the customer expects you to remember everything that was discussed/evaluated/decided at the initial onset.

The salesman needs to keep track of what's been happening in his territory.  This often takes the form of impromptu notes written on scraps of paper in his car, random photos snapped with his cellphone, a half-assed attempt to file emails in Outlook, or a multitude of half-completed excel spreadsheets across several folders and devices. In short, a mess.

## OBJECTIVE
This app aims to help address the common sales problem of tracking sales activity by providing a persistent, easy to use, secure and accessible centralized database for all sales "events" (phonecalls, new opportunities, new ideas, failed initiatives, photos, roledex of customers and contacts, etc).  It will also act as a hub to track KPIs across time (opportuntities generated, conversion rate, new customers engaged/clinched, etc).

## TODO
### General
- [ ] Add a favicon

### Landing Page
- [ ] 

### Registration Page
- [ ] Remove need to enter username - register via email instead

### Welcome Tutorial Page
- [ ] 

### Login Page
- [ ] Sign in via email instead of username

### Sales Entry Page
- [x] When adding an entry with a customer or contact that doesn't exist, prompt user if they'd like to create a new one
- [x] Add frontend checks for required fields (create, edit)
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
- [x] Display user friendly error message if any console error
- [x] Display user friendly success message if task completed successfully
- [ ] Display dollar value on entries
- [ ] Add urgency and/or likelihood values to entries
- [ ] Auto calculate priority rank based on urgency/likelihood and dollar value
- [ ] Allow suggestion dropdown list to be navigatable by arrow keys/enter
- [x] Make text in entry description wrap before increasing entry width
- [x] Show contact card when hovering over contact name
- [ ] Allow tag deletion by clicking 'x' inside suggestion dropdown
- [ ] Make filter and sort buttons to show modals, instead of dropdowns. Have an indicator for when a filter or sort is active.
- [ ] Separate page into "Active", "Complete", "Archived"
- [ ] Add large ? icon with message when no entries to display
- [ ] Use 3rd party API to lazy-load customer logos
- [ ] Use Google Maps API to map to customer locations
- [ ] Use LinkedIn API (?) to get contact pictures?
- [ ] 
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
- [ ] 
#### Sort Functionality
- [x] Implement sorting of entries by at least one criteria.  
- [ ] Allow sorting preference to be saved in user preferences each time
- [x] Sort by date created
- [x] Sort by customer name
- [x] Sort by flagged status
- [ ] Sort by dollar amount
- [ ] Sort by date completed
- [ ] Sort by date archived
- [ ] Sort by date edited
- [ ] Sort by date flagged
- [ ] Sort by has pictures
- [ ] Add secondary sort criteria
- [ ] Sort by rank/priority
- [ ] Easily remove all sorting criteria
- [ ] 

### Roledex Page
#### General
- [ ] Add large ? icon and message when no content to display
- [ ] Split page into Customers and Contacts display with buttons
#### Customers Sub-page
- [ ] Display all customers (companies)
- [ ] Group contacts by company
- [ ] Group customers (companies) by tags
- [ ] Show customers on map
- [ ] 
#### Contacts Sub-page
- [x] Display all contacts
- [x] Search contacts with search bar
- [x] Ability to create new contacts
- [x] Ability to delete contacts
- [x] Ability to edit existing contacts
- [x] Automatically create new customers if a contact is associated with a customer that doesn't yet exist
- [ ]

### KPIs Page
- [ ] Show User's profile info (picture, name, email, date joined, company)
- [ ] Ability to print page?
- [ ] Export data to excel or CSV
- [ ] Tabulate total $ opportunities
- [ ] Tabulute conversion rate
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
- [ ] 
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