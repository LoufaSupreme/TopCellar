
// ******** SEND JSON TO SERVER TO LOAD INTO DATABASE ********

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


async function loadResourceLocations() {
    const resourceLocationsURL = 'https://reservations.ontarioparks.com/api/resourcelocation/';

    // get json from ontario parks
    let resourceLocations_response = await fetch(resourceLocationsURL);
    let resourceLocationsList = await resourceLocations_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/resourceLocations', {
        method: 'POST',
        body: JSON.stringify({
          allResourceLocations: resourceLocationsList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
}


async function loadResourceCategories() {
    const resourceCategoriesURL = 'https://reservations.ontarioparks.com/api/resourcecategory';

    // get json from ontario parks
    let resourceCategories_response = await fetch(resourceCategoriesURL);
    let resourceCategoriesList = await resourceCategories_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/resourceCategories', {
        method: 'POST',
        body: JSON.stringify({
          allResourceCategories: resourceCategoriesList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
}


async function loadEquipment() {
    const equipmentURL = 'https://reservations.ontarioparks.com/api/equipment';

    // get json from ontario parks
    let equipment_response = await fetch(equipmentURL);
    let equipmentList = await equipment_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/equipment', {
        method: 'POST',
        body: JSON.stringify({
          allEquipment: equipmentList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
}


async function loadAttributes() {
    const attributesURL = 'https://reservations.ontarioparks.com/api/attribute/filterable';

    // get json from ontario parks
    let attributes_response = await fetch(attributesURL);
    let attributesList = await attributes_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/attributes', {
        method: 'POST',
        body: JSON.stringify({
          allAttributes: attributesList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
}


async function loadFeeCategories() {
    const feeCategoriesURL = 'https://reservations.ontarioparks.com/api/ratecategory/ratecategories';

    // get json from ontario parks
    let feeCategories_response = await fetch(feeCategoriesURL);
    let feeCategoriesList = await feeCategories_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/feeCategories', {
        method: 'POST',
        body: JSON.stringify({
          allFeeCategories: feeCategoriesList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
}


async function loadRootmaps() {
    const rootmapsURL = 'https://reservations.ontarioparks.com/api/resourcelocation/rootmaps';

    // get json from ontario parks
    let rootmaps_response = await fetch(rootmapsURL);
    let rootmapsList = await rootmaps_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/rootmaps', {
        method: 'POST',
        body: JSON.stringify({
          allRootmaps: rootmapsList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
}


async function loadSites() {
    const resourceLocationsURL = 'https://reservations.ontarioparks.com/api/resourcelocation/';

    // get json from ontario parks
    let resourceLocations_response = await fetch(resourceLocationsURL);
    let resourceLocationsList = await resourceLocations_response.json();
    console.log(`There are ${resourceLocationsList.length} locations to go through.`);

    // Get list of all sites within each resource location:
    for (let i = 0; i < resourceLocationsList.length; i++) {
        let resourceLocation = resourceLocationsList[i];
        let resourceLocationId = resourceLocation['resourceLocationId'];

        let allSiteInfoURL = `https://reservations.ontarioparks.com/api/resourcelocation/resources?resourceLocationId=${resourceLocationId}`;

        console.log(`Fetching info for ResLoc ${i}: ${resourceLocationId}`);
        let allSiteInfo_response = await fetch(allSiteInfoURL);
        let allSiteInfoList = await allSiteInfo_response.json();
    
        // send it to django server
        const csrf_token = getCookie('csrftoken');

        let finished_response = await fetch('/loadDatabase/sites', {
                                method: 'POST',
                                body: JSON.stringify({
                                allSites: allSiteInfoList,
                                resLoc: resourceLocationId
                                }),
                                headers: { "X-CSRFToken": csrf_token }
                            }).catch(error => console.error(error));
        let finished_status = await finished_response.json();
        console.log(finished_status);
        console.log(`Finished loading sites of ResLoc ${resourceLocationId}`);
    }
}


async function loadSites_oneLocation() {
    let resourceLocationId = -2147483646;

    let allSiteInfoURL = `https://reservations.ontarioparks.com/api/resourcelocation/resources?resourceLocationId=${resourceLocationId}`;

    let allSiteInfo_response = await fetch(allSiteInfoURL);
    let allSiteInfoList = await allSiteInfo_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/sites', {
        method: 'POST',
        body: JSON.stringify({
        allSites: allSiteInfoList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
    .then(response => response.json)
    .then(res => console.log(res));
}


async function load_camp_maps() {
    const mapsURL = 'https://reservations.ontarioparks.com/api/maps';

    // get json from ontario parks
    let campMaps_response = await fetch(mapsURL);
    let campMapsList = await campMaps_response.json();

    // send it to django server
    const csrf_token = getCookie('csrftoken');

    fetch('/loadDatabase/campMaps', {
        method: 'POST',
        body: JSON.stringify({
          allCampMaps: campMapsList
        }),
        headers: { "X-CSRFToken": csrf_token }
    })
    .then(response => response.json)
    .then(res => console.log(res))
    .catch(error => console.error(error));
}