
// global state 
let store = {
    "page": "index",
    "user": null,
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
        <div class='fs-700 ff-sans-cond letter-spacing-1 text-dark uppercase'>
            Welcome, <span class='fs-700 ff-sans-cond letter-spacing-1 text-accent uppercase'>${await getUser()}!</span>
        </div>

        <div class='form-container'>${makeEntryForm()}</div>
        <div class='container flex' id='entries-container'>${await displayEntries()}</div>
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


//////////////////////////////////////
// HTML COMPONENTS ///////////////////
//////////////////////////////////////

// append entry list into document body:
const displayEntries = async () => {
    // const container = document.querySelector('#entries-container');
    const entries = await getEntries();
    const html = collateEntries(entries);
    // container.innerHTML = html;
    return html;
}

// make html to render a new Entry form:
const makeEntryForm2 = () => {
    return `
        <form class='text-dark' id='entry-form'>
            <fieldset>
                <legend>New Sales Entry:</legend>
                <input type="text" placeholder="Account" name="customer">
                <input type="text" placeholder="Contact Name" name="contacts">
                <textarea placeholder="Description" name="description"></textarea>
                <input type="number" placeholder="Rank" name="rank">
                <input type="text" placeholder="Tags" name="tags">
                <input type="submit" value="Create" id="entry-submit-btn">
            </fieldset>
        </form>
    `;
}

const makeEntryForm = () => {
    return `
        <div class="form-container">
            <input type="text" placeholder="Account" name="customer-input">
            <div class="tag-container">
                <input type="text" placeholder="Contact Name" name="contact-input" class="tag-input">
            </div>
            <textarea placeholder="Description" name="description"></textarea>
            <input type="number" placeholder="Rank" name="rank">
            <div class="tag-container">
                <input type="text" placeholder="Tag" name="tag-input" class="tag-input">
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

const handleKeyUp = (e) => {
    // if user hits enter while inside an input box 'tag-input', create a new tag element:
    if (e.target.classList.contains('tag-input') && e.key === 'Enter' ) {
        const val = document.createElement('div');  
        val.classList.add('tag');
        val.innerHTML = e.target.value; // value of input
        const parent = e.target.parentElement; // container div
        parent.insertBefore(val, e.target); // add input value as new '.tag' element
        e.target.value = ''; // reset input box
    }
    // console.log(e);
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
const collateEntries = (entries) => {
    console.log('Collating Entries...');
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
