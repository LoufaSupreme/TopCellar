
// global state 
let store = {
    "page": "index",
    "user": null,
    "entries": null,
    "customers": null,
    "contacts": null,
    "tags": null,
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
        <div class='fs-700 ff-sans-cond letter-spacing-1 text-dark uppercase'>
            Welcome, <span class='fs-700 ff-sans-cond letter-spacing-1 text-accent uppercase'>${state.user}!</span>
        </div>

        ${makeEntryForm()}
        <div class='container flex' id='entries-container'>${displayEntries(state.entries)}</div>
        `;
    }
}

// from Django docs - get CSRF token from cookies
function getCookie(name) {
    // console.log(`Getting cookie: ${name}`);
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// fetch all user's entries from db:
const getEntries = async () => {
    console.log('Fetching Entries...');
    const res = await fetch('api/allEntries/');
    const entries = await res.json();

    return entries;
}

// fetch all user's customers from db:
const getCustomers = async () => {
    console.log('Fetching Customers...');
    const res = await fetch('api/allCustomers/');
    const customers = await res.json();

    return customers;
}

// fetch all user's contacts from db:
const getContacts = async () => {
    console.log('Fetching Contacts...');
    const res = await fetch('api/allContacts/');
    const contacts = await res.json();

    return contacts;
}

// fetch all user's tags from db:
const getTags = async () => {
    console.log('Fetching Tags...');
    const res = await fetch('api/allTags/');
    const tags = await res.json();

    return tags;
}

// fetch current user's username:
const getUser = async () => {
    console.log('Fetching Username...');
    const res = await fetch('api/currentUser/');
    const username = await res.json();

    return username;
}

// fetch whatever API call is passed as a targer:
const getList = async (target) => {
    const res = await fetch(`api/all${target}/`);
    const listItems = await res.json();

    return listItems;
}


// create a new entry instance in the db:
const newEntry = async (details) => {

    // get csrf token for put request
    const csrf_token = getCookie('csrftoken');

    fetch('api/newEntry/', {
        method: 'POST',
        body: JSON.stringify(details),
        headers: { "X-CSRFToken": csrf_token }
    })
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.error(err))
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


//////////////////////////////////////
// HTML COMPONENTS ///////////////////
//////////////////////////////////////


// make html to render a new Entry form:
const makeEntryForm = () => {
    const now = new Date();
    return `
        <div class="form-container" id="entry-form-container">

            <div class="suggestions" style="display:none">DUMMY TEXT</div>
    
            <div class="tag-container">
                <input id="customers-input" class="tag-input" type="text" data-id="undefined" data-list="customers" placeholder="Account">
            </div>
            <div class="tag-container">
                <input id="contacts-input" class="tag-input" type="text" data-id="undefined" data-list="contacts" placeholder="Add Contacts">
            </div>
            <textarea placeholder="Description" name="description"></textarea>
            <input type="date" value="${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}">
            <input type="number" placeholder="Rank">
            <div class="tag-container">
                <input id="tags-input" class="tag-input" type="text" data-id="undefined" data-list="tags" placeholder="Add Tags">
            </div>
        </div>
        <button type="buton" id="entry-submit-btn">CREATE</button>
    `;
}

//////////////////////////////////////
// HELPER FUNCTIONS /////////////////
//////////////////////////////////////

// handles clicks anywhere on the document.  Called on window load. 
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleClicks = (e) => {
    
    // fires when the entry submit button is clicked:
    if (e.target.id === 'entry-submit-btn') {
        const form = document.querySelector('#entry-form-container');
        const newEntryData = getFormData(form);
        newEntry(newEntryData);
    }

    // fires when a dropdown suggestion is clicked:
    if (e.target.classList.contains('suggestion')) {
         // get the input field corresponding to the clicked elements data-owner attribute:
        const input = document.querySelector(`#${e.target.dataset.owner}-input`);
        input.value = e.target.innerHTML;  // load the input 
        input.dataset.id = e.target.dataset.id; // set the data-id of the input to the same as the value object
        addTag(input);
        input.focus(); // resume focus on the input box
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

const displaySuggestions = (options, owner) => {
    return options
        .map(option => {
            return `<li class="suggestion ${owner}-suggestion" data-owner="${owner}" data-id="${option.id}">${option.name}</li>`
        })
        .join('');
}

// inserts a new element in the DOM with ".tag" classname
// used for customers, contacts and tags
const addTag = (inputField) => {
    const parent = inputField.parentElement; // container div

    // if there's already a customer name in the parent div, remove it.
    // only want one customer to be able to be selected at a time
    if (inputField.dataset.list === 'customers' && parent.firstChild) {
        parent.firstChild.remove();
    }

    // make new tag:
    const tag = document.createElement('div'); // make new tag div
    tag.classList.add('tag'); // add "tag" to classname list
    tag.dataset.id = inputField.dataset.id;  // id of the value (i.e. if customer name, then customer.id)
    tag.dataset.list = inputField.dataset.list; // take the input's data-list (e.g. "customers") and set to the tag
    tag.innerHTML = inputField.value; // value of input

    // check if this tag already exists:
    const tagExists = Array.from(parent.querySelectorAll('.tag'))
        .filter(el => {
            return el.dataset.id === tag.dataset.id && el.innerHTML === tag.innerHTML;
        }).length > 0;

    // if tag doesn't exist, add it:
    if (!tagExists) {
        parent.insertBefore(tag, inputField); // add input value as new '.tag' element before
    }

    inputField.value = ''; // reset input box
}

// handles keyup events anywhere on the document.  Called on window load. 
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleKeyUp = (e) => {

    if (e.target.dataset.list) {
        const targetList = e.target.dataset.list;
        const listItems = store[targetList];  // grab the list of items for targetList from store

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

        const suggestionArea = document.querySelector('.suggestions');
        suggestionArea.style.display = 'block';
        suggestionArea.innerHTML = `<ul>${displaySuggestions(options, targetList)}</ul>`

    }

    // if user hits enter while inside an input box 'tag-input', create a new tag element:
    if (e.target.classList.contains('tag-input') && e.key === 'Enter' ) {
        addTag(e.target);
    }
}


const getFormData = (form) => {
    
    const newEntryDetails = {
        "customer": {},
        "contacts": [],
        "tags": [],
        "description": null,
        "rank": null,
        "date": {},
    };

    const tagElements = Array.from(form.querySelectorAll('.tag'));

    const customer = tagElements.filter(tag => tag.dataset.list === 'customers')
        .forEach(cust => {
            newEntryDetails.customer.id = cust.dataset.id;
            newEntryDetails.customer.name = cust.innerHTML;
        });
    const contacts = tagElements.filter(tag => tag.dataset.list === 'contacts')
        .forEach(cont => {
            const names = cont.innerHTML.split(' ');
            const first_name = names[0];
            const last_name = names.length > 1 ? names[1] : "";
            
            newEntryDetails.contacts.push({
                "id": cont.dataset.id,
                "first_name": first_name,
                "last_name": last_name,
            })
        });
    const tags = tagElements.filter(tag => tag.dataset.list === 'tags')
        .forEach(tag => {
            newEntryDetails.tags.push({
                "id": tag.dataset.id !== undefined ? tag.dataset.id : 0,
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
    return entries.map(entry => {
        try {
            const contacts = entry.contacts.map(c => `${c.first_name} ${c.last_name}`);
            return `
                <div class='flex entry-container container bg-dark text-white'>
                    <div>ID: ${entry.id}</div>
                    ${entry.customer !== null ? `<div>${entry.customer.name}</div>` : ''}
                    ${contacts.length > 0 ? `<div>${contacts.join(', ')}</div>` : ''}
                    <div>${entry.description}</div>
                    ${entry.tags.length > 0 ? `<div>Tags: ${entry.tags.join(', ')}</div>` : ''}
                </div>
            `;
        } 
        catch (err) {
            console.error(err);
        }
    })
    .reduce((acc, entry) => {
        return acc + entry;
    },'')
}



// run on DOM content loaded:
window.addEventListener('load', () => {
    document.addEventListener('click', handleClicks);
    document.addEventListener('keyup', handleKeyUp);
    render(root, store);
});
