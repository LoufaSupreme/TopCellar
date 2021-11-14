// global state
let store = {
  page: "index", // determines what html to generate
  user: null, // username
  entries: null, // list of all user's entries
  customers: null, // list of all user's customers
  contacts: null, // list of all user's contacts
  tags: null, // list of all user's tags
  uncreated: null, // uncreated object instances (from user input)
};

// not currently in use...
const updateStore = (state, newState) => {
  store = Object.assign(newState, state);
};

// grab the root element which all html will be appended to:
const root = document.getElementById("root");

// render html:
const render = async (root, state) => {
  root.innerHTML = await App(state);
};

// create content
const App = async (state) => {
  if (state.page === "index") {
    await loadStore(state);

    return `
        <section id='header'>
            <div class="navbar flex bottom-shadow">
                ${makeNavBar()}
            </div>
            <div id='filter-accordion' class='accordion bottom-shadow'>
                ${makeEntryFilterBox()}
            </div>
            <div id='sort-accordion' class='accordion bottom-shadow'>
                ${makeEntrySortBox()}
            </div>
        </section>
        <section id='main'>
            ${makeModal('new-entry-modal')}
            ${makeModal('add-objects-modal')}
            ${makeAddBtn()}

            <div class='container flex' id='cards-container'>
                ${displayEntries(state.entries)}
            </div>
        </section>
    `;
  }
  else if (state.page === 'rolodex') {
      return `
        <section id='header'>
            <div class="navbar flex">
                ${makeNavBar()}
            </div>
        </section>
        <section id='main'>
            ${makeModal('new-entry-modal')}
            ${makeModal('add-objects-modal')}
            ${makeAddBtn()}

            <div class='container flex' id='cards-container'>
                ${displayContacts(state.contacts)}
            </div>
        </section>
  
      `;
  }
};

// loads relevant user data into the global store:
const loadStore = async (state) => {
    console.log("Fetching User Objects...");
    
    const promises = [
        getUser(),
        getList("Entries"),
        getList("Customers"),
        getList("Contacts"),
        getList("Tags"),
    ]

    return Promise.all(promises)
        .then(results => {
            state.user = results[0];
            state.entries = results[1];
            state.customers = results[2];
            state.contacts = results[3];
            state.tags = results[4];
            console.log({ store });
        })
        .catch(err => console.error(err));
}

//////////////////////////////////////
// HTML COMPONENTS ///////////////////
//////////////////////////////////////

//// navbar /////////////////////////
const makeNavBar = () => {
    return `
        <h1><a class='navbar-brand text-accent' href="/">TopCellar</a></h1>
        ${makeSearchBox()}
        <div class="nav-content flex">
            <ul class="navbar-nav flex">
                <li class="nav-item">
                    <a class="nav-link" href="/">Sales Activity</a>
                </li>
                <li class="nav-item">
                    <a id='rolodex-link' class="nav-link" href="#">Rolodex</a>
                </li>    
                <li class="nav-item">
                    <a class="nav-link" href="#">KPIs</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/logout">Log Out</a>
                </li>
            </ul>
        </div>
    `;
}

// create search box at top of screen to filter entries:
const makeSearchBox = () => {
    return `
        <div class='flex search-container'>
            <div class='search-bar-container flex neupho inset'>
                <input type="text" id="search" placeholder="Search">
                <div class='search-count fs-200 text-white'></div>
                <i class="fas fa-search"></i>
            </div>
        </div>
      `;
  };
  

//// ROLODEX /////////////////////////////////

// create contact card html for one contact:
const makeContactCard = (contact, regex = null) => {
    let name = contact.name;
    let company = contact.company ? contact.company.name : "";
    let position = contact.position ? contact.position : "";
    let email = contact.email ? contact.email : "";
    let phone_cell = contact.phone_cell ? contact.phone_cell : "";
    let phone_office = contact.phone_office ? contact.phone_office : "";
    let notes = contact.notes ? 'Notes...' : 'No Notes'; 
    
    // if a regular expression was given to filter the contacts,
    // then find and replace that regex with a highlight span
    if (regex) {
        name = name.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        company = company.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        position = position.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        email = email.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        phone_cell = phone_cell.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        phone_office = phone_office.replace(regex, (match) => {
            return `<span class='hl'>${match}</span>`;
          });
        if (contact.notes && contact.notes.match(regex)) {
            notes = `<span class='hl'>${notes}</span>`;
        }
    }

    return `
        <div id='contact-${contact.id}' class='contact-card neupho'>
            <div class='contact-btns-container flex'>
                <button class='contact-card-edit' data-id=${contact.id}>Edit</button>
                <button class='contact-card-del' data-id=${contact.id}>Delete</button>
            </div>
            <div class='company-container'>
                <div class='company-info-container'>
                    <div class='company-logo'>?</div>
                    <div class='company-name'>${company}</div>
                </div>
            </div>
            <div class='accent-rect-container'>
                <div class='accent-rect'><i class="bi bi-person-circle"></i></div>
                <div class='accent-rect'><i class="bi bi-globe"></i></div>
                <div class='accent-rect'><i class="bi bi-telephone"></i></div>
                <div class='accent-rect'><i class="bi bi-card-list"></i></div>
            </div>
            <div class='info-container'>
                <div class='info'>
                    <div class='name'><span class='fs-400 text-accent'>${name}</span></div>
                    <div class='position'>${position}</div>
                </div>
                <div class='info'>
                    <div class='email'>${email}</div>
                </div>
                <div class='info'>
                    <div class='cell'>${phone_cell}</div>
                    <div class='office'>${phone_office}</div>
                </div>
                <div class='info'>
                    <div class='notes'>${notes}</div>
                </div>
            </div>
        </div>
    `;
}

// loads relevant user data into the global store:
const loadStore = async (state) => {
    state.user = await getUser();
    state.entries = await getEntries();
    state.customers = await getCustomers();
    state.contacts = await getContacts();
    state.tags = await getTags();

    console.log({store});
    // updateStore(state, store);
}

// gets the data from the filter form:
const getFilterFormData = (form) => {
    const tagElements = Array.from(form.querySelectorAll(".tag")); // grab all of the tag elements

    const customers = tagElements
        .filter((tag) => tag.dataset.list === "customers")
        .map((cust) => {
            return {
                id: parseInt(cust.dataset.id),
                name: cust.innerText,
            };
        });

    const contacts = tagElements
        .filter((tag) => tag.dataset.list === "contacts")
        .map((cont) => {
            const names = cont.innerText.trim().split(" ");
            const first_name = names[0];
            const last_name = names.length > 1 ? names[1] : null;

            return {
                id: parseInt(cont.dataset.id),
                first_name: first_name,
                last_name: last_name,
            };
        });

    const tags = tagElements
        .filter((tag) => tag.dataset.list === "tags")
        .map((tag) => {
            return {
                id: tag.dataset.id !== undefined ? parseInt(tag.dataset.id) : -1,
                name: tag.innerText,
            };
        });

    
    let fromDate = form.querySelector('#filter-date-from').value.split("-");
    fromDate = fromDate.length === 3 ? fromDate : '';

    let toDate = form.querySelector('#filter-date-to').value.split("-");
    toDate = toDate.length === 3 ? toDate : '';

    const anyAllSelect = form.querySelector('#filter-any-all').value;

    // get checkbox data:
    const checkBoxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));

    const flagged = checkBoxes
        .filter(box => box.classList.contains('cb-flagged') && box.checked === true)
        .map(box => {
            return {
                name: box.name,
                value: box.value,
            }
        });

    const status = checkBoxes
        .filter(box => box.classList.contains('cb-status') && box.checked === true)
        .map(box => box.value);    

    console.log(status);

    const filterParameters = {
        type: anyAllSelect,
        customers: customers,
        contacts: contacts, 
        tags: tags, 
        fromDate: fromDate,
        toDate: toDate,
        flagged: flagged,
        status: status,
    }

    return filterParameters;
}

//////////////////////////////////////
// EVENT HANDLER FUNCTIONS ////////////
//////////////////////////////////////

// handles a dropdown suggestion being clicked:
const handleSuggestionClicked = (suggestion) => {
    // get the input associated with that suggestion (has id = suggestion.dataset.inputid):
    const input = document.querySelector(`#${suggestion.dataset.inputid}`);
    input.value = suggestion.innerHTML; // load the input
    input.dataset.id = suggestion.dataset.id; // set the data-id of the input to the same as the value object

    addTag(input);
    input.focus(); // resume focus on the input box
};

// deletes an entry:
const handleEntryDelete = (entry_id) => {
  const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
  entryContainer.remove(); // remove it from DOM
  deleteInstance("entry", entry_id);
};

// deletes a contact:
const handleContactDelete = (contact_id) => {
    const contactCard = document.querySelector(`#contact-${contact_id}`);
    contactCard.remove();
    deleteInstance('contact', contact_id);
}

// helper function
// returns a json object for the date/time of right meow:
const rightAboutNow = () => {
    let now = new Date();
    return {
        day: now.getDate(),
        month: now.getMonth()+1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
    }
}

// changes entry flagged status:
const handleEntryFlag = (entry_id) => {
    const entry = store.entries.find(entry => entry.id === parseInt(entry_id));
    const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
    const flagBtn = entryContainer.querySelector('.fave-entry-btn');

    const flagTime = rightAboutNow();
    
    if (entry.flagged) {
        flagBtn.classList.remove('inset');
        flagBtn.innerHTML = "<i class='bi bi-flag'></i>";  
        entry.flagged = false;
        entry.date_flagged = null;
        updateInstance(entry, 'entry', entry_id);  
    }
    else {
        flagBtn.classList.add('inset');
        flagBtn.innerHTML = "<i class='bi bi-flag-fill'></i>";  
        entry.flagged = true; 
        entry.date_flagged = flagTime; 
        updateInstance(entry, 'entry', entry_id);  
    }
}

// changes entry status (input via dropdown select)
// fired from the select dropdown onchange event
const statusChange = (dropdown, entry_id) => {
    const entry = store.entries.find(entry => entry.id === parseInt(entry_id));

    if (dropdown.value === 'active') {
        entry.completed = false;
        entry.date_completed = null;
        entry.archived = false;
        entry.date_archived = null;
    }
    else if (dropdown.value === 'complete') {
        entry.completed = true;
        entry.date_completed = rightAboutNow();
        entry.archived = false;
        entry.date_archived = null;
    }
    else if (dropdown.value === 'archived') {
        entry.completed = false;
        entry.date_completed = null;
        entry.archived = true;
        entry.date_archived = rightAboutNow();
    }
    else {
        console.error('Status not recognized');
    }
    
    // update the db:
    updateInstance(entry, 'entry', entry_id);
}

// handles clicks anywhere on the document.  Called on window load.
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleClicks = (e) => {
    // console.log(e.target);
    
    // fires when user clicks big "+" btn:
    // generates new entry form for entry creation:
    if (e.target.id === "add-btn") {
        if (store.page === 'index') {
            const entryForm = makeEntryForm();
            const modal = document.querySelector('#new-entry-modal');
            modal.innerHTML = entryForm;
            modal.classList.add('open');
        }
        else if (store.page === 'rolodex') {
            const contactForm = makeContactForm();
            const modal = document.querySelector('#new-entry-modal');
            modal.innerHTML = contactForm;
            modal.classList.add('open');
        }
    }
    
    // fires when the entry submit button is clicked:
    else if (e.target.id === "submit-new-btn") {
        if (store.page === 'index') {
            console.log('User submitting data for new entry...')
            // grab the form from which the entry data came from:
            const form = document.querySelector("#entry-form-container"); 
            initiateNewEntry(form); // initiate the creation of a new entry            
        }
        else if (store.page === 'rolodex') {
            console.log('User submitting data for new contact...')
            // grab the form from which the entry data came from:
            const form = document.querySelector('#contact-form-container');
            initiateNewContact(form);
        }
    }

    else if (e.target.id === "cancel-new-btn") {
        const modal = document.querySelector('#new-entry-modal');
        modal.classList.remove('open');
    }

    // submit when editing an existing contact:
    else if (e.target.id === 'submit-edit-btn') {
        const form = document.querySelector('#contact-form-container');
        initiateNewContact(form, +e.target.dataset.id);
    }

    // fires when a dropdown suggestion is clicked:
    else if (e.target.classList.contains("suggestion")) {
        handleSuggestionClicked(e.target);
    }

    // cancel or accept changes btn on user prompt modal to add customers and contacts:
    else if (e.target.classList.contains("modal-btn")) {
        const modal = document.querySelector("#add-objects-modal");
        if (e.target.id === "modal-accept-btn") handleModalAccept();
        modal.classList.remove("open");
    }

    else if (e.target.classList.contains('fave-entry-btn')) {
        handleEntryFlag(e.target.dataset.id);
    }

    // fires when user clicks on edit btn inside an existing entry:
    else if (e.target.classList.contains("edit-entry-btn")) {
        const entry_id = e.target.dataset.id;
        const entryContainer = document.querySelector(`#entry-${entry_id}`);
        makeEditForm(entryContainer);
    }

    // fires when user clicks on delete btn inside an existing entry:
    else if (e.target.classList.contains("delete-entry-btn"))
        handleEntryDelete(e.target.dataset.id);

    // fires when user clicks on accept changes btn when entry is being edited
    else if (e.target.id === "accept-edit-btn") {
        const entry_id = e.target.dataset.id; // get the entry ID from the buttons data-id attribute
        const form = document.querySelector(`#entry-${entry_id}`); // grab the div (entry container) that contains all the inputs
        initiateEdit(form, entry_id);
    }

    // fires when user clicks on cancel btn when entry is being editied
    else if (e.target.id === "cancel-edit-btn") {
        const entry_id = parseInt(e.target.dataset.id);
        const entryContainer = document.querySelector(`#entry-${entry_id}`);
        const entry = store.entries.find((ent) => ent.id === entry_id);
        entryContainer.outerHTML = makeEntryHTML(entry);
    } 

        // fires when user clicks on a tag's "X"
    else if (e.target.classList.contains('tag-close-btn')) {
        e.target.parentNode.remove();
    }

    // fires when user clicks on "filter" btn within filter container
    else if (e.target.id === 'filter-btn') {
        const form = document.querySelector('#filter-container');
        const filterParams = getFilterFormData(form);
        const filteredEntries = filterEntries(store.entries, filterParams);
        const entriesContainer = document.querySelector('#cards-container');
        entriesContainer.innerHTML = displayEntries(filteredEntries);
    }

    // fires when user clicks on "sort" btn within the sort container
    else if (e.target.id === 'sort-btn') {
        const form = document.querySelector('#sort-container');
        const sortBy = form.querySelector('#sortBy').value;
        const sortDirection = form.querySelector('#sortDirection').value;
        const sortParams = {
            sortBy: sortBy,
            sortDirection: sortDirection,
        }
        const sortedEntries = sortEntries(store.entries, sortParams);
        const entriesContainer = document.querySelector('#cards-container');
        entriesContainer.innerHTML = displayEntries(sortedEntries, true);
    }

    // fires when user clicks "filter" or "sort" beside the add btn
    else if (e.target.classList.contains('accordion')) {
        e.target.classList.toggle('accordion-open');
        const chevron = e.target.querySelector('.bi-chevron-down');
        chevron.classList.toggle('bi-chevron');
        chevron.classList.toggle('bi-chevron-up');
    }

    // fires when user clicks on little filter cutout on sidebar:
    else if (e.target.id === 'sidebar-open-btn') {
        const sidebar = document.querySelector('#sidebar')
        sidebar.classList.toggle('open');
    }

    // click on Rolodex nav link - switch page
    else if (e.target.id === 'rolodex-link') {
        e.preventDefault();
        store.page = 'rolodex';
        render(root, store);
    }

    // click on "delete" btn inside contact card:
    else if (e.target.classList.contains('contact-card-del')) {
        const contact_id = e.target.dataset.id;
        handleContactDelete(contact_id);
    }

    else if (e.target.classList.contains('contact-card-edit')) {
        const contact = store.contacts.find(el => el.id === +e.target.dataset.id);
        const contactForm = makeContactForm(contact);
        const modal = document.querySelector('#new-entry-modal');
        modal.innerHTML = contactForm;
        modal.classList.add('open');
    }
};


// populate the suggestion dropdown with options:
const listSuggestions = (inputBox) => {
    const listType = inputBox.dataset.list;
    const listItems = store[listType]; // grab the list of items for listType from store

    // the below is now not needed since all have 'name' properties:
    let options = [];
    if (listType === "customers") {
        options = findMatches(inputBox.value, listItems, ["name"]);
    } 
    else if (listType === "contacts") {
        options = findMatches(inputBox.value, listItems, ["first_name", "last_name"]);
    } 
    else {
        options = findMatches(inputBox.value, listItems, ["name"]);
    }

    options = options.map((option) => {
        return { suggestion: option, active: false };
    });

    return options;
}

// fires everytime a user types in the search box.
// used to filter the entries on screen
const handleSearchInput = (searchInput) => {
    // create an "or" regex statement for each word in search bar:
    const targetValue = searchInput.value.split(' ').join('|');
    const regex = new RegExp(targetValue, "gi");

    // display for # of returned results:
    const searchCount = document.querySelector('.search-count');
    const cardsContainer = document.querySelector("#cards-container");
    const currentEntries = [...store.entries];  // creates a copy
    const currentContacts = [...store.contacts];

    // if only typed 1 letter, display the full set of entries: 
    if (targetValue.length < 1 && store.page === 'index') {
        cardsContainer.innerHTML = displayEntries(currentEntries);
        searchCount.style.display = 'none';
    }
    // or the full set of contacts:
    else if (targetValue.length < 1 && store.page === 'rolodex') {
        cardsContainer.innerHTML = displayContacts(currentContacts);
        searchCount.style.display = 'none';
    }
    else if (store.page === 'index') {
        const filtered = searchEntries(currentEntries, regex);
        cardsContainer.innerHTML = displayEntries(filtered, regex);
        searchCount.style.display = 'block';
        if (filtered.length === 0) {
            searchCount.innerHTML = `No results found`;
        }
        else if (filtered.length === 1) {
            searchCount.innerHTML = `${filtered.length} result`;
        } else {
            searchCount.innerHTML = `${filtered.length} results`;
        }
    }
    else if (store.page === 'rolodex') {
        const filtered = searchContacts(currentContacts, regex);
        cardsContainer.innerHTML = displayContacts(filtered, regex);
        searchCount.style.display = 'block';
        if (filtered.length === 0) {
            searchCount.innerHTML = `No results found`;
        }
        else if (filtered.length === 1) {
            searchCount.innerHTML = `${filtered.length} result`;
        } else {
            searchCount.innerHTML = `${filtered.length} results`;
        }
    }
};

// handles keyup events anywhere on the document.  Called on window load.
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleKeyUp = (e) => {
    if (e.target.classList.contains("tag-input")) {
        const inputBox = e.target;
        const parent = inputBox.parentElement;
        const parentHeight = parent.getBoundingClientRect().height;
        const suggestionArea = parent.querySelector(".suggestions");
        // set the position of the suggestion box to be just underneath the input box
        suggestionArea.style.setProperty('transform', `translateY(${parentHeight-5}px)`);

        suggestionArea.style.setProperty('width', `75%`);

        const listType = inputBox.dataset.list;

        // if the input box is not empty and its in focus, display the suggestions:
        if (inputBox.value.trim() !== '' && inputBox === document.activeElement) {
            const options = listSuggestions(inputBox);
            if (options.length > 0) {
                suggestionArea.style.display = "block";
                suggestionArea.innerHTML = displaySuggestions(inputBox.id, options, listType);
            }
            else suggestionArea.style.display = "none";
        }
        else suggestionArea.style.display = "none";
    }

    // if user hits enter while inside an input box w/ class 'tag-input', create a new tag element:
    if (e.target.classList.contains("tag-input") && e.key === "Enter") {
        addTag(e.target);
    }

    if (e.target.id === "search") handleSearchInput(e.target);
};

// returns a filtered array
// for each el[prop] combination of el in arr and prop in propertyList, checks whether targetWord matches:
const findMatches = (targetWord, arr, propertyList) => {
    const results = arr.filter((el) => {
        const regex = new RegExp(targetWord, "gi");
        return propertyList
            .map((prop) => {
                return el[prop] !== null ? el[prop].match(regex) : null;
            })
            .filter((prop) => prop !== null)[0];
    });
    return results;
};


// inserts a new element in the DOM with ".tag" classname
// used for customers, contacts and tags
const addTag = (inputField) => {
    const parent = inputField.parentNode; // container div
    // if there's already a customer name in the parent div, remove it.
    // only want one customer to be able to be selected at a time
    if (inputField.dataset.list === "customers" && parent.querySelector(".tag") && !inputField.classList.contains('filter-input')) {
        parent.firstElementChild.remove();
    }

    // make new tag:
    const tag = document.createElement('div'); // make new tag div
    tag.classList.add('tag'); // add "tag" to classname list
    tag.dataset.id = inputField.dataset.id === 'undefined' ? -1 : inputField.dataset.id;  // id of the value (i.e. if customer name, then customer.id)
    tag.dataset.list = inputField.dataset.list; // take the input's data-list (e.g. "customers") and set to the tag
    tag.innerHTML = inputField.value; // value of input

    // check if this tag already exists:
    // returns boolean
    const tagExists =
        Array.from(parent.querySelectorAll(".tag")).filter((el) => {
        return (
            el.dataset.id === tag.dataset.id &&
            el.innerHTML.trim() === tag.innerHTML
        );
        }).length > 0;

    // if tag doesn't exist, add it:
    if (!tagExists) {
        parent.insertBefore(tag, inputField); // add input value as new '.tag' element before the input field

        // hide suggestion box again:
        const suggestionBox = parent.querySelector('.suggestions');
        suggestionBox.style.display = "none";
        
    }

    inputField.value = ""; // reset input box
    inputField.dataset.id = undefined; // reset data-id
};

// returns list of entries that contain the target string anywhere:
const searchEntries = (entries, regex) => {
    const filtered = entries.filter((entry) => {
        let customerMatch = false;
        let descriptionMatch = false;
        let contactMatch = false;
        let tagMatch = false;

        if (entry.customer) customerMatch = entry.customer.name.match(regex);

        if (entry.description) descriptionMatch = entry.description.match(regex);

        if (entry.contacts)
        contactMatch =
            entry.contacts.filter((con) => {
                if (con.last_name) {
                    return con.first_name.match(regex) || con.last_name.match(regex);
                } 
                else return con.first_name.match(regex);
            }).length > 0;
        if (entry.tags)
        tagMatch =
            entry.tags.filter((tag) => {
                return tag.name.match(regex);
            }).length > 0;

        return customerMatch || descriptionMatch || contactMatch || tagMatch;
    });

  return filtered;
};

// returns list of contacts that contain the target string anywhere:
const searchContacts = (contacts, regex) => {
    const filtered = contacts.filter(contact => {
        let companyMatch = false;
        let contactMatch = false;
        let emailMatch = false;
        let positionMatch = false;
        let cellPhoneMatch = false;
        let officePhoneMatch = false;
        let notesMatch = false;

        if (contact.company) companyMatch = contact.company.name.match(regex);
        if (contact.name) contactMatch = contact.name.match(regex);
        if (contact.email) emailMatch = contact.email.match(regex);
        if (contact.phone_cell) {
            const cell = contact.phone_cell.toString();
            cellPhoneMatch = cell.match(regex);
        }
        if (contact.phone_office) {
            const office = contact.phone_office.toString();
            officePhoneMatch = office.match(regex);
        }
        if (contact.position) positionMatch = contact.position.match(regex);
        if (contact.notes) notesMatch = contact.notes.match(regex);

        return companyMatch || contactMatch || emailMatch || positionMatch || cellPhoneMatch || officePhoneMatch || notesMatch;
    });

    return filtered;
}

// returns list of entries that match filter criteria
const filterEntries = (entries, criteria) => {
    
    // returns a list of booleans, one for each customer criteria matched
    function customerMatch(entry) {
        let customerMatches = [];
        // for each customer in criteria, check if it matches the entry's customer:
        for (let i = 0; i < criteria.customers.length; i++) {
            const criteriaCustomer = criteria.customers[i];
            if (
                entry.customer.name === criteriaCustomer.name &&
                entry.customer.id === criteriaCustomer.id    
            ) {
                // if the customer matches, add true to the array
                customerMatches.push(true)
            }
            // otherwise add false (no match)
            else customerMatches.push(false);
        }
        return customerMatches;
    }

    // returns a list of booleans, one for each contact criteria matched
    function contactMatch(entry) {
        let contactMatches = [];
        // for each contact in criteria, check if it matches any of the entry contacts:
        for (let i = 0; i < criteria.contacts.length; i++) {
            const criteriaContact = criteria.contacts[i];
            const contactMatch = entry.contacts.filter(contact => {
                return contact.id === criteriaContact.id;
            });
            
            // if a non-empty array was returned, add true to array:
            if (contactMatch.length > 0) contactMatches.push(true);
            else contactMatches.push(false);
        }
        return contactMatches;
    }

    // returns a list of booleans, one for each tag criteria matched
    function tagMatch(entry) {
        let tagMatches = [];
        // for each tag in criteria, check if it matches any of the entry tags:
        for (let i = 0; i < criteria.tags.length; i++) {
            const criteriaTag = criteria.tags[i];
            const tagMatch = entry.tags.filter(tag => {
                return tag.id === criteriaTag.id;
            });

            // if a non-empty array was returned, add true to array.
            if (tagMatch.length > 0) tagMatches.push(true);
            else tagMatches.push(false);
        }
        return tagMatches;
    }


    function flagMatch(entry) {
        let flagMatches = [];

        for (let i = 0; i < criteria.flagged.length; i++) {
            const flagType = criteria.flagged[i];
            if (String(entry.flagged) === flagType.value) flagMatches.push(true);
            else flagMatches.push(false);
        }
        return flagMatches;
    }

    function statusMatch(entry) {
        let statusMatches = [];

        for (let i = 0; i < criteria.status.length; i++) {
            const criteriaStatus = criteria.status[i];
            if (
                criteriaStatus === 'active' && 
                entry.completed === false &&
                entry.archived === false
            ) {
                statusMatches.push(true)
            }
            else if (entry[criteriaStatus] === true) {
                statusMatches.push(true)
            }
            else statusMatches.push(false);
        }
        return statusMatches;
    }
    
    // returns a boolean
    // true if entry timestamp matches date criteria
    // type = "any" or "all"
    function dateMatch(entry, type) {
        
        if (type === 'any') {
            // if no date criteria specified, ignore all entries
            if (criteria.fromDate === '' && criteria.toDate === '') return false;
        }
        else if (type === 'all') {
            if (criteria.fromDate === '' && criteria.toDate === '') return true;
        }

        // if only toDate given, take all entries created up to that date:
        else if (criteria.fromDate === '' && criteria.toDate !== '') {
            const targetEndDate = new Date(
                parseInt(criteria.toDate[0]),
                parseInt(criteria.toDate[1]),
                parseInt(criteria.toDate[2])
            );

            const entryDate = new Date(
                entry.timestamp.year,
                entry.timestamp.month,
                entry.timestamp.day
            );
            
            newEntryDetails.contacts.push({
                "id": cont.dataset.id,
                "first_name": first_name,
                "last_name": last_name,
            })
        });
    const tags = tagElements.filter(tag => tag.dataset.list === 'tags')
        .forEach(tag => {
            newEntryDetails.tags.push({
                "id": tag.dataset.id !== undefined ? tag.dataset.id : -1,
                "name": tag.innerHTML,
            })
        });
    const description = form.querySelector('textarea').value;
    const rank = form.querySelector('input[type="number"]').value;
    const date = form.querySelector('input[type="date"]').value.split('-');

    newEntryDetails.date.year = parseInt(date[0]);
    newEntryDetails.date.month = parseInt(date[1]);
    newEntryDetails.date.day = parseInt(date[2]);
    newEntryDetails.description = description;
    newEntryDetails.rank = rank;

    console.log(newEntryDetails);
    return newEntryDetails;
}

    
    // if user chose "any" in dropdown
    // i.e. return entries that include ANY of the filter criteria:
    if (criteria.type === 'any') {
        console.log('Filtering entries matching ANY criteria...')

        entries = entries.filter(entry => {

            // check if any customers match
            if (entry.customer) {
                const customerMatches = customerMatch(entry)
                // if any of the criteria matched, add to filtered array
                if (customerMatches.length > 0 && customerMatches.some(el => el === true)) return true;
            }

            // check if any contacts match
            if (entry.contacts) {
                const contactMatches = contactMatch(entry);
                // if any of the criteria matched, add to filtered array
                if (contactMatches.length > 0 && contactMatches.some(el => el === true)) return true;
            }

            // check if any tags match
            if (entry.tags) {
                const tagMatches = tagMatch(entry);
                // if any of the criteria matched, add to filtered array
                if (tagMatches.length > 0 && tagMatches.some(el => el === true)) return true;
            }

            // check if flag criteria matches:
            const flagMatches = flagMatch(entry);
            if (flagMatches.length > 0 && flagMatches.some(el => el === true)) return true;

            const statusMatches = statusMatch(entry);
            if (statusMatches.length > 0 && statusMatches.some(el => el === true)) return true;

            // check if date range matches
            const dateMatches = dateMatch(entry, 'any');
            if (dateMatches) return true;
        });
        return entries;
    }

    // return entries that satisfy ALL the filter criteria at once:
    else if (criteria.type === 'all') {
        console.log('Filtering entries matching ALL criteria...')
        return entries = entries.filter(entry => {
            // array of booleans for each check
            let allMatches = [];
            
            // check if entry matches date criteria:
            if (dateMatch(entry, 'all')) allMatches.push(true);
            else allMatches.push(false);

            // check if flag criteria matches:
            const flagMatches = flagMatch(entry);
            // if the flagMatches array is empty, treat it as if it passed the match test
            if (flagMatches.length === 0) allMatches.push(true);
            else if (flagMatches.length > 0 && flagMatches.every(el => el === true)) allMatches.push(true);
            else allMatches.push(false);

            // check if status (completed, archived, active) matches:
            const statusMatches = statusMatch(entry);
            // if the statusMatches array is empty, treat it as if it passed the match test
            if (statusMatches.length === 0) allMatches.push(true);
            else if (statusMatches.length > 0 && statusMatches.every(el => el === true)) allMatches.push(true);
            else allMatches.push(false);
            
            // check if entry customer matches:
            if (entry.customer && criteria.customers.length > 0) {
                const matches = customerMatch(entry);
                if (matches.length > 0 && matches.every(el => el === true)) {
                    allMatches.push(true);
                }
                else allMatches.push(false);
            }

            if (entry.contacts && criteria.contacts.length > 0) {
                const matches = contactMatch(entry);
                if (matches.length > 0 && matches.every(el => el === true)) {
                    allMatches.push(true);
                }
                else allMatches.push(false);
            }

            if (entry.tags && criteria.tags.length > 0) {
                const matches = tagMatch(entry);
                if (matches.length > 0 && matches.every(el => el === true)) {
                    allMatches.push(true);
                } 
                else allMatches.push(false);
            }

            if (allMatches.length > 0 && allMatches.every(el => el === true)) return true;
        })
    }
}

const sortEntries = (entries, criteria) => {
    console.log(`Sorting entries by ${criteria.sortBy} in ${criteria.sortDirection} order...`);

    if (criteria.sortBy === 'date') {
        entries = entries.sort((a, b) => {
            const a_date = new Date(
                a.timestamp.year, 
                a.timestamp.month - 1, 
                a.timestamp.day, 
                a.timestamp.hour,
                a.timestamp.minute,
                a.timestamp.second
            );
            const b_date = new Date(
                b.timestamp.year, 
                b.timestamp.month - 1, 
                b.timestamp.day, 
                b.timestamp.hour,
                b.timestamp.minute,
                b.timestamp.second
            );
            if (criteria.sortDirection === 'descending') {
                return a_date > b_date ? -1 : 1;
            }
            else return a_date > b_date ? 1 : -1;
        })
    }
    else if (criteria.sortBy === 'customer_name') {
        entries = entries.sort((a, b) => {
            const a_customer_name = a.customer ? a.customer.name : null;
            const b_customer_name = b.customer ? b.customer.name : null;
            if (criteria.sortDirection === 'descending') {
                return a_customer_name > b_customer_name ? -1 : 1;
            }
            else return a_customer_name > b_customer_name ? 1 : -1;
        })
    }
    else if (criteria.sortBy === 'flagged') {
        entries = entries.sort((a, b) => {
            if (criteria.sortDirection === 'descending') {
                return a.flagged > b.flagged ? 1 : -1;
            }
            else return a.flagged > b.flagged ? -1 : 1;
        })
    }

    return entries;
}

// display each entry on the page:
// regex is for the search function
const displayEntries = (entries, regex = null) => {
    console.log("Displaying Entries...");

    return entries
        .map((entry) => makeEntryHTML(entry, regex))
        .join("");
};

const displayContacts = (contacts, regex = null) => {
    console.log("Displaying Contacts...");

    return contacts
        .map(contact => makeContactCard(contact, regex))
        .join("");
}

// run on DOM content loaded:
window.addEventListener("load", () => {
  document.addEventListener("click", handleClicks);
  document.addEventListener("keyup", handleKeyUp);
  render(root, store);
});
