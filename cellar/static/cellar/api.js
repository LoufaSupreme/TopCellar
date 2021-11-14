
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
    .then(res => {
        if (res.error) {
            throw `DJANGO: ${res.error}`;
        }
        else {
            console.log(res);
            return res;
        }
    })
    .catch(err => console.error(err))
}
