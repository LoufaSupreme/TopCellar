
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

    fetch(numResultsURL)
    .then(response => response.json())
    .then(response => {
        let numResults = response['num_results'];
        console.log(numResults);
        document.getElementById('num-results').innerText = `${numResults} matching sites.`
    })
    .catch(err => console.log(err));
} 
 

// window.addEventListener('DOMContentLoaded', () => {
//     if (localStorage.getItem('selected_loc') && document.getElementById('loc-select')) {
//         document.getElementById('loc-select').options[localStorage.getItem('selected_loc')].selected = true;
//     }
// })

async function getAvailability(locs, maps) {
    // 'https://reservations.ontarioparks.com/api/availability/map?mapId=-2147483376&bookingCategoryId=0&resourceLocationId=-2147483585&equipmentCategoryId=-32768&subEquipmentCategoryId=-32766&startDate=2021-06-16&endDate=2021-06-24&getDailyAvailability=true&isReserving=true&filterData=[]&boatLength=null&boatDraft=null&boatWidth=null&partySize=3&seed=2021-04-27T16:39:26.856Z'

    let partySize = 1;
    let bookingCategory = 0;
    // let mapId = -2147483376;
    // let resourceLocationId = -2147483585;
    let subEquipCatId = -32766;
    let now = new Date();
    startDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    let endDate = new Date();
    endDate.setDate(now.getDate() + 7);
    endDate = `${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`;

    let responses = {};
    for (let i = 0; i < locs.length; i++) {
        console.log(locs.length);
        let mapId = maps[i];
        let resourceLocationId = locs[i];

        let availabilityURL = `https://reservations.ontarioparks.com/api/availability/map?partySize=${partySize}&bookingCategoryId=${bookingCategory}&mapId=${mapId}&equipmentCategoryId=-32768&getDailyAvailability=true&isReserving=true&resourceLocationId=${resourceLocationId}&subEquipmentCategoryId=${subEquipCatId}&startDate=${startDate}&endDate=${endDate}`;

        try {
            let mapinfo_response = await fetch(availabilityURL);
            let maplist = await mapinfo_response.json();

            for (let campMap in maplist['mapLinkAvailabilities']) {
                mapId = campMap;
                availabilityURL = `https://reservations.ontarioparks.com/api/availability/map?partySize=${partySize}&bookingCategoryId=${bookingCategory}&mapId=${mapId}&equipmentCategoryId=-32768&getDailyAvailability=true&isReserving=true&resourceLocationId=${resourceLocationId}&subEquipmentCategoryId=${subEquipCatId}&startDate=${startDate}&endDate=${endDate}`;
                try {
                    let avail_response = await fetch(availabilityURL);
                    let avail_list = await avail_response.json();

                    for (site in avail_list['resourceAvailabilities']) {
                        responses[site] = avail_list['resourceAvailabilities'][site];
                    }
                }
                catch(err) {
                    console.log(err);
                }
            }
        }
        catch(err) {
            console.log(err);
        }
    }
    return responses;
}


async function addAvailability(locs, maps) {
    let responses = await getAvailability(locs, maps);  
    siteContainers = document.getElementsByClassName('site-container');
    for (site of siteContainers) {
        let resLoc = site.getAttribute('data-res-loc');
        let mapId = site.getAttribute('data-map-id');
        let siteId = site.getAttribute('data-res-id');
        let siteAvailList = responses[parseInt(siteId)];
        
        let siteAvailUL = document.getElementById(`${siteId}-availability-list`);
        for (day in siteAvailList) {
            dayAvail = document.createElement('li');
            let status = 'Unknown';
            let target_date = new Date();
            target_date.setDate(target_date.getDate() + parseInt(day));
            target_date = `${target_date.getFullYear()}-${target_date.getMonth()+1}-${target_date.getDate()}`;
        
            if (parseInt(siteAvailList[day]['availability']) > 0){
                status = 'Yes';
            } else {
                status = 'No';
            }
            dayAvail.innerText = `${target_date}: ${status}`;
            siteAvailUL.append(dayAvail);
        }
    }
}
