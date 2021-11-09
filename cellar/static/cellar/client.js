

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

    // console.log({entries});
    return entries;
}

// fetch all user's customers from db:
const getCustomers = async () => {
    console.log('Fetching Customers...');
    const res = await fetch('api/allCustomers/');
    const customers = await res.json();

    // console.log({entries});
    return customers;
}

// fetch all user's contacts from db:
const getContacts = async () => {
    console.log('Fetching Contacts...');
    const res = await fetch('api/allContacts/');
    const contacts = await res.json();

    // console.log({entries});
    return contacts;
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
    return entries = entries.map(entry => {
        return `
            <ul>
                <li>ID: ${entry.id}</li>
                <li>Description: ${entry.description}</li>
            </ul>
        `;
    })
    .reduce((acc, entry) => {
        return acc += entry;
    },'')
}

// append entry list into document body:
const displayEntries = async () => {
    const body = document.querySelector('body');
    const entries = await getEntries();
    const html = collateEntries(entries);
    body.innerHTML = html;
}

// create a new entry instance in the db:
const newEntry = async () => {
    const details = {
        "customer": "Knoll",
        "contact": "Big Chungus",
        "date": "Jan 25, 2021",
        "description": "Sooooo much fuggin text holy cow."
    }

    // get csrf token for put request
    const csrf_token = getCookie('csrftoken');

    const res = await fetch('api/newEntry/', {
        method: 'POST',
        body: JSON.stringify(details),
        headers: { "X-CSRFToken": csrf_token }
    })
    const response = await res.json();
    console.log(response);
}