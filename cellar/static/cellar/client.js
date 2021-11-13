
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
        return `
        ${await loadStore(state)}
        <div class='fs-700 ff-sans-cond letter-spacing-1 text-dark uppercase'>
            Welcome, <span class='fs-700 ff-sans-cond letter-spacing-1 text-accent uppercase'>${state.user}!</span>
        </div>

        <div class='form-container'>${makeEntryForm()}</div>
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
    return `
        <div class="form-container">
            <input type="text" data-accountID="" data-list="customers" placeholder="Account">
            <div class="suggestions" style="display: none">DUMMY TEXT</div>
            <div class="tag-container">
                <input class="tag-input" type="text" data-list="contacts" placeholder="Contact Name">
            </div>
            <textarea placeholder="Description" name="description"></textarea>
            <input type="number" placeholder="Rank">
            <div class="tag-container">
                <input class="tag-input" type="text" data-list="tags" placeholder="Tag">
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
    if (e.target.id === 'entry-submit-btn') {
        e.preventDefault();
        getFormData();
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

const displaySuggestions = (options) => {
    return options
        .map(option => {
            `<li>${option}</li>`
        })
        .join('');
}

// handles keyup events anywhere on the document.  Called on window load. 
// this is to avoid having to make new event handlers for dynamic content (like the form)
const handleKeyUp = async (e) => {

    if (e.target.dataset.list) {
        const targetList = e.target.dataset.list;
        const listItems = store[targetList];  // grab the list of items for targetList from store

        let options = [];
        if (targetList === 'customers') {
            options = findMatches(e.target.value, listItems, ['name']);
        }
        else if (targetList === 'contacts') {
            options = findMatches(e.target.value, listItems, ['first_name', 'last_name']);
        }
        else {
            options = findMatches(e.target.value, listItems, ['tag']);
        }
        // listItems = await getList(`${e.target.dataset.list}`);
        console.log(options);

        const suggestionArea = document.querySelector('.suggestions');
        suggestionArea.style.display = 'block';
        suggestionArea.innerHTML = `<ul>${displaySuggestions(options)}</ul>`

    }

    // if user hits enter while inside an input box 'tag-input', create a new tag element:
    if (e.target.classList.contains('tag-input') && e.key === 'Enter' ) {
        const val = document.createElement('div');  
        val.classList.add('tag');
        val.innerHTML = e.target.value; // value of input
        const parent = e.target.parentElement; // container div
        parent.insertBefore(val, e.target); // add input value as new '.tag' element
        e.target.value = ''; // reset input box
    }
}


const getFormData = () => {
    const form = document.getElementById('entry-form');
    const inputs = form.querySelectorAll('input, textarea');
    let values = {};
    inputs.forEach(input => values[input.name] = input.value);
    console.log(values);
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



const contacts = [
    {
        "first_name": "Jane",
        "last_name": "Doe" 
    },
    {
        "first_name": "Big",
        "last_name": "Chungus"
    }
]

const date = {
    "day": 25,
    "month": 1,
    "year": 2021
}

const newEntryDetails = {
    "customer": "Knoll",
    "contacts": contacts,
    "date": date,
    "description": "Sooooo much fuggin text holy cow.",
    "completed": false,
    "archived": false, 
    "tags": ['Urgent', 'Boring']
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

// run on DOM content loaded:
window.addEventListener('load', () => {
    document.addEventListener('click', handleClicks);
    document.addEventListener('keyup', handleKeyUp);
    render(root, store);
});
