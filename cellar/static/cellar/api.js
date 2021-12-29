///// HELPER FUNCTIONS
function capitalizeFirstLetter(string) {
    return string = string[0].toUpperCase() + string.substring(1);
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


// fetch current user's username:
const getUser = async () => {
    try {
        console.log('Fetching Username...');
        const res = await fetch('api/currentUser/');
        const username = await res.json();

        return username;
    }
    catch (err) {
        console.error(err);
    }
}


// fetch one instance of type "target" ('entry', 'contact', 'customer'):
const getInstance = async (target, id) => {
    try {
        console.log(`Fetching details for ${target}: ${id}`);
        const res = await fetch(`api/${target}/${id}`);
        const instance = await res.json();

        return instance;
    }
    catch (err) {
        console.error(err);
    }
}

// send put request to update an instance:
// keywords: 'entry', 'customer', 'contact'
const updateInstance = async (details, keyword, id) => {
    console.log(`Updating ${keyword} ${id}...`);
    console.log(details)
    // get csrf token for put request
    const csrf_token = getCookie('csrftoken');

    try {
        const res = await fetch(`api/${keyword}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(details),
            headers: { "X-CSRFToken": csrf_token }
        });
        const obj = await res.json();
        if (obj.error) {
            throw `DJANGO: ${obj.error}`;
        }
        else {
            console.log(`Success! ${capitalizeFirstLetter(keyword)} ${id} updated:`);
            console.log(obj);
            displayAlert(`Success! ${capitalizeFirstLetter(keyword)} updated.`, 'success');
            return obj;
        }
    }
    catch (err) {
        console.error(err);
        displayAlert(`Error: ${err}`, 'danger');
    }
}

// send delete request to delete an instance:
const deleteInstance = async (keyword, id) => {
    console.log(`Deleting ${keyword} ${id}...`)
    // get csrf token for put request
    const csrf_token = getCookie('csrftoken');

    try {
        const res = await fetch(`api/${keyword}/${id}`, {
            method: 'DELETE',
            headers: { "X-CSRFToken": csrf_token }
        });
        const obj = await res.json();
        if (obj.error) {
            throw `DJANGO: ${obj.error}`;
        }
        else {
            console.log(`Success! ${capitalizeFirstLetter(keyword)} ${id} deleted.`);
            displayAlert(`Success! ${capitalizeFirstLetter(keyword)} deleted.`, 'success');
            return 'success';
        }
    }
    catch (err) {
        console.error(err);
        displayAlert(`Error: ${err}`, 'danger');
    }
}


// fetch whatever API call is passed as a target ('Entries', 'Customers', 'Tags'):
const getList = async (target) => {
    try {
        const res = await fetch(`api/all${target}/`);
        const listItems = await res.json();
        return listItems;
    }
    catch (err) {
        console.error(err);
    }
}


// create a new model instance in the db:
// returns newly created object(s)
// keywords: entry, customer, contact
const newInstance = async (details, keyword) => {

    console.log(`Creating new ${keyword} instance...`)
    // get csrf token for post request
    const csrf_token = getCookie('csrftoken');

    try {
        const res = await fetch(`api/new_${keyword}/`, {
            method: 'POST',
            body: JSON.stringify(details),
            headers: { "X-CSRFToken": csrf_token }
        });
        const obj = await res.json();
        if (obj.error) {
            throw `DJANGO: ${obj.error}`;
        }
        else {
            console.log(`Success! ${capitalizeFirstLetter(keyword)} created:`);
            console.log(obj);
            displayAlert(`Success! ${capitalizeFirstLetter(keyword)} created.`, 'success');
            return obj;
        }
    }
    catch (err) {
        console.error(err);
        displayAlert(`Error: ${err}`, 'danger');
    }
}

// takes FormData object as parameter
const addFiles = async (formData, entry_id) => {
    console.log(`Adding files to Entry ${entry_id}`);
    // get csrf token for put request
    const csrf_token = getCookie('csrftoken');

    try {
        const res = await fetch(`api/addFiles/${entry_id}`, {
            method: 'PUT',
            body: formData,
            headers: { "X-CSRFToken": csrf_token }
        });
        const response = await res.json();
        if (response.error) {
            throw `DJANGO: ${obj.error}`;
        }
        else {
            console.log(`Success! Files added to Entry ${entry_id}.`);
            console.log(response);
            displayAlert(`Success! Files added to Entry ${entry_id}.`, 'success');
            return response;
        }
    }
    catch (err) {
        console.error(err);
        displayAlert(`Error: ${err}`, 'danger');
    }
}
