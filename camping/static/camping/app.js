
// from Django docs - get CSRF token from cookies
function getCookie(name) {
    console.log(`Getting cookie: ${name}`);
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


function numResults() {    
    let locSelect = document.getElementById('loc-select');
    let catSelect = document.getElementById('cat-select');
    let equipSelect = document.getElementById('equip-select');
    let attrSelect = document.getElementById('attr-select');

    // https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
    //  Get all the selected options of a multiselect into a list
    let locSelectOptions = [...locSelect.options].filter(option => option.selected).map(option => option.value);

    localStorage.setItem('selected_cat', catSelect);

    const csrf_token = getCookie('csrftoken');

    fetch('/getNumResults', {
        method: 'POST',
        body: JSON.stringify({
          locSelects: locSelectOptions,
          catSelect: catSelect.value,
          equipSelect: equipSelect.value,
          attrSelect: attrSelect.value
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
    .then(response => response.json())
    .then(response => {
        let numResults = response['num_results'];
        console.log(numResults);
        document.getElementById('num-results').innerText = `${numResults} matching sites.`
    })
} 

// window.addEventListener('DOMContentLoaded', () => {
//     if (localStorage.getItem('selected_loc') && document.getElementById('loc-select')) {
//         document.getElementById('loc-select').options[localStorage.getItem('selected_loc')].selected = true;
//     }
// })
    
