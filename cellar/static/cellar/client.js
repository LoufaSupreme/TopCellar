
// global state 
let store = {
    "page": "index",        // determines what html to generate
    "user": null,           // username
    "entries": null,        // list of all user's entries
    "customers": null,      // list of all user's customers
    "contacts": null,       // list of all user's contacts
    "tags": null,           // list of all user's tags
    "uncreated": null,      // uncreated object instances (from user input)
}

// not currently in use...
const updateStore = (state, newState) => {
    store = Object.assign(newState, state);
}

// grab the root element which all html will be appended to:
const root = document.getElementById('root');

// render html:
const render = async (root, state) => {
    root.innerHTML = await App(state);
}

// create content
const App = async (state) => {
    if (state.page === 'index') {
        await loadStore(state)
        
        return `
        ${makeModal()}
        <div class='fs-700 ff-sans-cond letter-spacing-1 text-dark uppercase'>
            Welcome, <span class='fs-700 ff-sans-cond letter-spacing-1 text-accent uppercase'>${state.user}!</span>
        </div>

        ${makeEntryForm()}
        <div class='container flex' id='entries-container'>${displayEntries(state.entries)}</div>
        `;
    }
}

// loads relevant user data into the global store:
const loadStore = async (state) => {
    console.log('Fetching User Objects...');
    state.user = await getUser();
    state.entries = await getList('Entries');
    state.customers = await getList('Customers');
    state.contacts = await getList('Contacts');
    state.tags = await getList('Tags');

    console.log({store});
    // updateStore(state, store);
}


//////////////////////////////////////
// HTML COMPONENTS ///////////////////
//////////////////////////////////////


// generate HTML for one entry:
const makeEntryHTML = (entry) => {
    const contacts = entry.contacts.map(c => `${c.first_name} ${c.last_name}`);

    return `
        <div id='entry-${entry.id}' class='flex entry-container container bg-dark text-white'>
            <div>ID: ${entry.id}</div>
            ${entry.customer !== null ? `<div class='entry-customer'>${entry.customer.name}</div>` : ''}
            ${contacts.length > 0 ? `<div class='entry-contacts'>${contacts.join(', ')}</div>` : ''}
            <div>${entry.description}</div>
            ${entry.tags.length > 0 ? `<div>Tags: ${entry.tags.join(', ')}</div>` : ''}
            <button id='entry-${entry.id}-edit-btn' class='edit-entry-btn' data-id='${entry.id}'>Edit</button>
            <button id='entry-${entry.id}-delete-btn' class='delete-entry-btn' data-id='${entry.id}'>Delete</button>
        </div>
    `;
}

// generate HTML for suggestion dropdowns:
// entry_ID is the ID of the entry div that this dropdown is associated with.  Null if not associated with one (e.g. making new entry)
const makeSuggestionDiv = (type, entry_ID = null) => {
    return `<div class='suggestions ${type}-suggestions' style='display: none' data-type='${type}' data-id='${entry_ID}'>DUMMY TEXT</div>`; 
}


// make html to render a new Entry form:
const makeEntryForm = () => {
    const now = new Date();
    // add leading zeros to dates if less than 10 (important for date input values...):
    const month = now.getMonth()+1 < 10 ? `0${now.getMonth()+1}` : now.getMonth()+1;
    const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();

    return `
        <div class="form-container" id="entry-form-container">
    
            <div class="tag-container">
                <input id="customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account">
                ${makeSuggestionDiv('customers')}
            </div>
            <div class="tag-container">
                <input id="contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
                ${makeSuggestionDiv('contacts')}
            </div>
            <textarea placeholder="Description" name="description"></textarea>
            <input type="date" value="${now.getFullYear()}-${month}-${day}">
            <input type="number" placeholder="Rank">
            <div class="tag-container">
                <input id="tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
                ${makeSuggestionDiv('tags')}
            </div>
        </div>
        <button type="buton" id="entry-submit-btn">CREATE</button>
    `;
}

// create a modal div (for pop up user prompts)
const makeModal = () => {
    return `
        <div class="modal">
            <div class="promptContainer"></div>
        </div>
    `;
}


// generates HTML for the popup modal with details on the to-be-created customer and/or contacts:
const generateModalText = (customer, contacts) => {
    
    let promptText = '';
    if (customer) {
        promptText += `
            <div>We couldn't find the following customer in your Rolodex</div>
            <div>${customer.name}</div>
        `;
    }

    if (contacts) {
        const contactText = contacts.map(contact => {
            return `
                <div>${contact.first_name} ${contact.last_name}</div>
            `
        }).join('');

        promptText += `
            <div>We couldn't find the following contacts in your Rolodex</div>
            ${contactText}
        `;
    }

    promptText += `
        <div>Would you like to add them now?</div>
        <button id='modal-accept-btn' class='accept-btn modal-btn'>ACCEPT</button>
        <button id='modal-cancel-btn' class='cancel-btn modal-btn'>CANCEL AND MAKE CHANGES</button>
    `
    return promptText;
}


// fires when an Edit btn is clicked within an existing entry
const makeEditForm = async (entryContainer) => {

    const entry_ID = entryContainer.id.split('-')[1];
    const entry = await getInstance('entry', entry_ID);

    const customerTag = makeTagElement('customers', entry.customer.id, entry.customer.name).outerHTML;
    const contactTags = entry.contacts
        .map(c => makeTagElement('contacts', c.id, `${c.first_name} ${c.last_name}`).outerHTML)
        .join('');
    const tagTags = entry.tags
        .map(t => makeTagElement('tags', t.id, t).outerHTML)
        .join('');

    // add leading zeros to dates if less than 10 (important for date input values...):
    const month = entry.timestamp.month < 10 ? `0${entry.timestamp.month}` : entry.timestamp.month;
    const day = entry.timestamp.day < 10 ? `0${entry.timestamp.day}` : entry.timestamp.day;
    
    entryContainer.innerHTML = `
            <div class="tag-container">
                ${customerTag}
                <input id="customers-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account">
                ${makeSuggestionDiv('customers', entry_ID)}
            </div>
            <div class="tag-container">
                ${contactTags}
                <input id="contacts-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
                ${makeSuggestionDiv('contacts', entry_ID)}
            </div>
            <textarea placeholder="Description" name="description">${entry.description}</textarea>
            <input type="date" value="${entry.timestamp.year}-${month}-${day}">
            <input type="number" placeholder="Rank" value="${entry.rank}">
            <div class="tag-container">
                ${tagTags}
                <input id="tags-input-${entry_ID}" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
                ${makeSuggestionDiv('tags', entry_ID)}
            </div>
            <button id='accept-edit-btn' data-id="${entry_ID}">Accept Changes</button>
            <button id='cancel-edit-btn' data-id='${entry_ID}'>Cancel</button>
        `;
}


// create the html for a new tag div:
const makeTagElement = (type, id, content) => {
    const tag = document.createElement('div'); // make new tag div
    tag.classList.add('tag'); // add "tag" to classname list
    tag.dataset.id = id === 'undefined' ? -1 : id;  // id of the content (i.e. if customer name, then customer.id)
    tag.dataset.list = type; // the type of tag e.g. 'customers' or 'contacts'
    tag.innerHTML = content; // the text of the tag
    return tag;
}


//////////////////////////////////////
// HELPER FUNCTIONS /////////////////
//////////////////////////////////////

// creates a new entry:
// fired if user clicks on the accept btn in the popup modal (when creating entries with new customer or contacts):
const handleModalAccept = async () => {
    if (store.uncreated) {

        if (store.uncreated.customer) {
            const newCustomer = await newInstance(store.uncreated.customer, 'Customer');
            store.uncreated.customer.id = newCustomer.id;        
        }

        if (store.uncreated.contacts) {
            const newContacts = await newInstance(store.uncreated.contacts, 'Contacts'); // create new contacts in db
            newContacts.forEach(c => {
                const target = store.uncreated.contacts.find(el => c.first_name === el.first_name && c.last_name === el.last_name);
                target.id = c.id; 
            });
        }
    }

    if (store.uncreated.mode === 'create') {
        // make a new entry from the stored new entry details:
        newInstance(store.uncreated.entry, 'Entry');
        store.uncreated = null; // reset store.uncreated to null

        // const form = document.querySelector('#entry-form-container'); // grab the parent elem of the input elements
        // const tagElements = Array.from(form.querySelectorAll('.tag')); // grab all of the tag elements
        // tagElements.forEach(el => el.remove());  // remove them from the DOM now that the entry is created   
        await loadStore(store);
        render(root, store);
 
    }
    else if (store.uncreated.mode === 'update') {
        // update the existing instance:
        updateInstance(store.uncreated.entry, 'entry', store.uncreated.entry.id);
        store.uncreated = null; // reset store.uncreated to null
        await loadStore(store);
        render(root, store);
    }
    else {
        console.error('Uncreated Object mode is neither create nor update...');
    }
}

// creates and displays a modal for the user to choose whether to make new customer/contact objects, or go back and edit the entry before submitting.
const promptUserMakeObj = (newObjects) => {
    const modal = document.querySelector('.modal');
    const container = modal.querySelector('.promptContainer');

    const modalText = generateModalText(newObjects.customer, newObjects.contacts);
    
    container.innerHTML = modalText;
    modal.classList.add('open');
}

// fired when the "create" btn is clicked to submit a new entry
const initiateNewEntry = async (form) => {
    console.log('Initiated new entry...');

    // get all the inputted data from the entry form
    const newEntryData = getFormData(form); 
    const newObjects = checkNewInstances(newEntryData, 'create');

    // if there are some new objects, let the user know:
    if (newObjects.customer !== null || newObjects.contacts !== null) {
        console.log('Found new Customer or Contact instances. Prompting user...');
        store.uncreated = newObjects;  // load new objects into store so they can be created if the user wishes
        promptUserMakeObj(newObjects); // create a modal user prompt to ask them if they want to create the new objects
    }
    else {
        // otherwise send post request to DB to make new entry:
        newInstance(newEntryData, 'Entry');
        await loadStore(store);
        render(root, store);
        // const tagElements = Array.from(form.querySelectorAll('.tag')); // grab all of the tag elements
        // tagElements.forEach(el => el.remove());  // remove them from the DOM now that the entry is created 

    }
}

const initiateEdit = async (form, entry_id) => {
    console.log(`Updating Entry ${entry_id}`);

    // get all the inputted data from the entry form
    const newEntryData = getFormData(form); 
    const newObjects = checkNewInstances(newEntryData, 'update');
    newObjects.entry.id = entry_id;

    // if there are some new objects, let the user know:
    if (newObjects.customer !== null || newObjects.contacts !== null) {
        console.log('Found new Customer or Contact instances. Prompting user...');
        store.uncreated = newObjects;  // load new objects into store so they can be created if the user wishes
        promptUserMakeObj(newObjects); // create a modal user prompt to ask them if they want to create the new objects
    }
    else {
        // otherwise send put request to DB to update the entry:
        updateInstance(newEntryData, 'entry', entry_id);
        await loadStore(store);
        render(root, store);
    }
}

// takes the data from an entry form (new or edit) and checks if there are customers or contacts that don't yet exist:
// returns the new objects in a newObjects object:
const checkNewInstances = (data, keyword) => {
    const customer = data.customer;
    const contacts = data.contacts;
    
    // check for inputted customers or contacts that don't yet exist and add them to a newObjects object
    const newContacts = contactExists(contacts);

    const newObjects = {
        "mode": keyword,
        "customer": !customerExists(customer) ? customer : null,
        "contacts": newContacts.length > 0 ? newContacts : null,
        "entry": data,
    };

    return newObjects;
}

// checks if a passed customer object already exists:
// returns boolean
const customerExists = (customer) => {
    const existingCustomers = store.customers;

    return existingCustomers.filter(el => {
        return el.id === customer.id && el.name.toLowerCase() === customer.name.toLowerCase();
    }).length > 0;
}

// checks if a passed array of contact objects already exists:
// returns a filtered array of the contacts that don't exist:
const contactExists = (contacts) => {
    const existingContacts = store.contacts;

    return contacts.filter(elem => {
        return !existingContacts.find(x => {
            return elem.id === x.id && elem.first_name.toLowerCase() === x.first_name.toLowerCase();
        });
    });
}


// capture the inputted values for new entry:
const getFormData = (form) => {
    
    const tagElements = Array.from(form.querySelectorAll('.tag')); // grab all of the tag elements

    const customer = tagElements.filter(tag => tag.dataset.list === 'customers')
        .map(cust => {
            return {
                "id": parseInt(cust.dataset.id),
                "name": cust.innerHTML,
            };
        })[0]; 
    const contacts = tagElements.filter(tag => tag.dataset.list === 'contacts')
        .map(cont => {
            const names = cont.innerHTML.split(' ');
            const first_name = names[0];
            const last_name = names.length > 1 ? names[1] : "";
            
            return {
                "id": parseInt(cont.dataset.id),
                "first_name": first_name,
                "last_name": last_name,
            };
        });
    const tags = tagElements.filter(tag => tag.dataset.list === 'tags')
        .map(tag => {
            return {
                "id": tag.dataset.id !== undefined ? parseInt(tag.dataset.id) : -1,
                "name": tag.innerHTML,
            };
        });
    const description = form.querySelector('textarea').value;
    const rank = form.querySelector('input[type="number"]').value;
    const date = form.querySelector('input[type="date"]').value.split('-');

    // create details for new entry:
    const newEntryDetails = {
        "customer": customer,
        "contacts": contacts,
        "tags": tags,
        "description": description,
        "rank": rank,
        "date": {
            "year": parseInt(date[0]),
            "month": parseInt(date[1]),
            "day": parseInt(date[2]),
        },
    };

    console.log('Got form data:'); 
    console.log(newEntryDetails);
    return newEntryDetails;
}

//////////////////////////////////////
// EVENT HANDLER FUNCTIONS ////////////
//////////////////////////////////////


// handles the entry submit btn being clicked to submit a new entry:
const handleEntrySubmitClicked = () => {
    const form = document.querySelector('#entry-form-container'); // grab the parent elem of the form
    initiateNewEntry(form); // initiate the creation of a new entry
}

// handles a dropdown suggestion being clicked:
const handleSuggestionClicked = (suggestion) => {
    // get the input associated with that suggestion (has id = suggestion.dataset.inputid):
    const input = document.querySelector(`#${suggestion.dataset.inputid}`)
    input.value = suggestion.innerHTML;  // load the input 
    input.dataset.id = suggestion.dataset.id; // set the data-id of the input to the same as the value object
    
    addTag(input);
    input.focus(); // resume focus on the input box
}

// handles the accept or cancel btn on the modal for new object entries (customers or contacts)
const handleModalBtnClicked = (btn) => {
    const modal = document.querySelector('.modal');

    if (btn.id === 'modal-accept-btn') handleModalAccept();
    modal.classList.remove('open');
}

// deletes an entry:
const handleEntryDelete = (entry_id) => {
    const entryContainer = document.querySelector(`#entry-${entry_id}`); // get the container div of the entry
    entryContainer.remove(); // remove it from DOM
    deleteInstance('entry', entry_id);
}

// handles clicks anywhere on the document.  Called on window load. 
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleClicks = (e) => {
    
    // fires when the entry submit button is clicked:
    if (e.target.id === 'entry-submit-btn') handleEntrySubmitClicked();

    // fires when a dropdown suggestion is clicked:
    else if (e.target.classList.contains('suggestion')) handleSuggestionClicked(e.target);

    // cancel or accept changes btn on user prompt modal to add customers and contacts:
    else if (e.target.classList.contains('modal-btn')) handleModalBtnClicked(e.target);

    // fires when user clicks on edit btn inside an existing entry:
    else if (e.target.classList.contains('edit-entry-btn')) {
        const entry_id = e.target.dataset.id;
        const entryContainer = document.querySelector(`#entry-${entry_id}`);
        makeEditForm(entryContainer);
    }

    // fires when user clicks on delete btn inside an existing entry:
    else if (e.target.classList.contains('delete-entry-btn')) handleEntryDelete(e.target.dataset.id);

    // fires when user clicks on accept changes btn when entry is being edited
    else if (e.target.id === 'accept-edit-btn') {
        const entry_id = e.target.dataset.id; // get the entry ID from the buttons data-id attribute
        const form = document.querySelector(`#entry-${entry_id}`); // grab the div (entry container) that contains all the inputs
        initiateEdit(form, entry_id);
    }

    // fires when user clicks on cancel btn when entry is being editied
    else if (e.target.id === 'cancel-edit-btn') {
        const entry_id = parseInt(e.target.dataset.id);
        const entryContainer = document.querySelector(`#entry-${entry_id}`);
        const entry = store.entries.find(ent => ent.id === entry_id);
        entryContainer.outerHTML = makeEntryHTML(entry);
    }

}


// handles keyup events anywhere on the document.  Called on window load. 
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleKeyUp = (e) => {

    if (e.target.dataset.list) {
        const targetList = e.target.dataset.list;
        const listItems = store[targetList];  // grab the list of items for targetList from store
        const parent = e.target.parentElement;

        // the below is now not needed since all have 'name' properties:
        let options = [];
        if (targetList === 'customers') {
            options = findMatches(e.target.value, listItems, ['name']);
        }
        else if (targetList === 'contacts') {
            options = findMatches(e.target.value, listItems, ['first_name', 'last_name']);
        }
        else {
            options = findMatches(e.target.value, listItems, ['name']);
        }

        const suggestionArea = parent.querySelector('.suggestions');
        suggestionArea.style.display = 'block';
        suggestionArea.innerHTML = `<ul>${displaySuggestions(e.target.id, options, targetList)}</ul>`;

    }

    // if user hits enter while inside an input box w/ class 'tag-input', create a new tag element:
    if (e.target.classList.contains('tag-input') && e.key === 'Enter' ) {
        addTag(e.target);
    }
}

// returns a filtered array
// for each el[prop] combination of el in arr and prop in propertyList, checks whether targetWord matches:
const findMatches = (targetWord, arr, propertyList) => {
    return arr.filter(el => {
        const regex = new RegExp(targetWord, 'gi');
        return propertyList
            .map( prop => {
                return el[prop] !== null ? el[prop].match(regex) : null;
            })
            .filter(prop => prop !== null)[0];
    })   
}

const displaySuggestions = (inputID, options, type) => {
    return options
        .map(option => {
            return `<li class="suggestion ${type}-suggestion" data-type="${type}" data-inputID='${inputID}' data-id="${option.id}">${option.name}</li>`
        })
        .join('');
}


// inserts a new element in the DOM with ".tag" classname
// used for customers, contacts and tags
const addTag = (inputField) => {
    const parent = inputField.parentNode; // container div

    // if there's already a customer name in the parent div, remove it.
    // only want one customer to be able to be selected at a time
    if (inputField.dataset.list === 'customers' && parent.querySelector('.tag')) {
        parent.firstElementChild.remove();
    }

    // make new tag:
    const tag = makeTagElement(inputField.dataset.list, inputField.dataset.id, inputField.value)
    
    // check if this tag already exists:
    const tagExists = Array.from(parent.querySelectorAll('.tag'))
        .filter(el => {
            return el.dataset.id === tag.dataset.id && el.innerHTML === tag.innerHTML;
        }).length > 0;

    // if tag doesn't exist, add it:
    if (!tagExists) {
        parent.insertBefore(tag, inputField); // add input value as new '.tag' element before the input field
    }

    inputField.value = ''; // reset input box
    inputField.dataset.id = undefined;  // reset data-id
}


// filter array of entries based on criteria
// criteria is an object with key:value pairs of what to filter {"author.name": 'Jane Doe', "user.id": 1}
const filterEntries = (entries, criteria) => {
    
    const filteredEntries = entries.filter(entry => {
        for (let key in criteria) {
            const keys = key.split('.');

            let val = entry;
            for (let k of keys) {
                if (val[k]) {
                    val = val[k]
                }
            }
            if (val === undefined || val != criteria[key]) {
                return false;
            }
        }
        return true;
    });

    return filteredEntries;
}



// display each entry on the page:
const displayEntries = (entries) => {
    console.log('Displaying Entries...');
    return entries.map(entry => makeEntryHTML(entry)).reverse().join('');
}


// run on DOM content loaded:
window.addEventListener('load', () => {
    document.addEventListener('click', handleClicks);
    document.addEventListener('keyup', handleKeyUp);
    render(root, store);
});
