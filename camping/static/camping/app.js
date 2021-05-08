
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

    let loc_q_string = '';
    for (loc of locSelectOptions) {
        loc_q_string += `&res-loc-dd=${loc}`;
    }

    let cat_q_string = `res-cat-dd=${catSelect.value}`;
    let equip_q_string = `equip-dd=${equipSelect.value}`;
    let attr_q_string = `attr-dd=${attrSelect.value}`

    let numResultsURL = `/getNumResults?${cat_q_string}${loc_q_string}&${equip_q_string}&${attr_q_string}`;
    // console.log(numResultsURL);

    fetch(`${numResultsURL}`)
    .then(response => response.json())
    .then(response => {
        let numResults = response['num_results'];
        console.log(numResults);
        document.getElementById('num-results').innerText = `${numResults} matching sites.`
    });
} 
 

// window.addEventListener('DOMContentLoaded', () => {
//     if (localStorage.getItem('selected_loc') && document.getElementById('loc-select')) {
//         document.getElementById('loc-select').options[localStorage.getItem('selected_loc')].selected = true;
//     }
// })

function getAvailability() {
    const availabilityURL = 'https://reservations.ontarioparks.com/api/availability/map?mapId=-2147483376&bookingCategoryId=0&resourceLocationId=-2147483585&equipmentCategoryId=-32768&subEquipmentCategoryId=-32766&startDate=2021-06-16&endDate=2021-06-24&getDailyAvailability=true&isReserving=true&filterData=[]&boatLength=null&boatDraft=null&boatWidth=null&partySize=3&seed=2021-04-27T16:39:26.856Z'
}
    
'https://reservations.ontarioparks.com/api/availability/map?partySize=3&bookingCategoryId=0&mapId=-2147483376&equipmentCategoryId=-3276&getDailyAvailability=true&isReserving=true8&resourceLocationId=-2147483585&subEquipmentCategoryId=-32766&startDate=2021-06-16&endDate=2021-06-24'