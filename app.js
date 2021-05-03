
// API Routes

//  e.g. for below: 'https://reservations.ontarioparks.com/api/resourcelocation/resources?resourceLocationId=-2147483647'
const resourceLocations = 'https://reservations.ontarioparks.com/api/resourcelocation/';
const resourceCategories = 'https://reservations.ontarioparks.com/api/resourcecategory';
const equipment = 'https://reservations.ontarioparks.com/api/equipment';
const rateCategories = 'https://reservations.ontarioparks.com/api/ratecategory/ratecategories';


// uses resourceLocations
const dateSchedule = 'https://reservations.ontarioparks.com/api/dateschedule/resourcelocationid?resourceLocationId=-2147483631';

// const allSiteInfo = 'https://reservations.ontarioparks.com/api/resourcelocation/resources?resourceLocationId=-2147483585';


const mapIDs = 'https://reservations.ontarioparks.com/api/maps';
const bookingCategories = 'https://reservations.ontarioparks.com/api/bookingcategories';
const searchCriteriaTags = 'https://reservations.ontarioparks.com/api/searchcriteriatabs';
const capacityCategories = 'https://reservations.ontarioparks.com/api/capacitycategory/capacitycategories';

// uses either resourceCategories or resourceLocations
const photos = 'https://reservations.ontarioparks.com/api/photo/resource?resourceId=-2147480405';

const availability = 'https://reservations.ontarioparks.com/api/availability/map?mapId=-2147483376&bookingCategoryId=0&resourceLocationId=-2147483585&equipmentCategoryId=-32768&subEquipmentCategoryId=-32766&cartUid=af717bea-6cd8-424d-a695-0595545e4258&bookingUid=3&startDate=2021-06-16&endDate=2021-06-17&getDailyAvailability=false&isReserving=true&filterData=%5B%5D&boatLength=null&boatDraft=null&boatWidth=null&partySize=3&seed=2021-04-27T16:39:26.856Z';

const siteAvailability = 'https://reservations.ontarioparks.com/api/availability/resourcestatus?resourceId=-2147472303&bookingUid=71347ea9-8680-4fda-8b1e-b8ae81f18483&cartUid=af717bea-6cd8-424d-a695-0595545e4258&cartTransactionUid=a59c80d7-9d7b-457c-8daa-692b53ed483e&bookingCategoryId=0&startDate=2021-06-16T00:00:00.000Z&endDate=2021-06-17T00:00:00.000Z&isReserving=true&equipmentId=-32768&subEquipmentId=-32766&boatLength=null&boatDraft=null&boatWidth=null&partySize=3&filterData=%5B%5D';

const siteDailyAvailability = 'https://reservations.ontarioparks.com/api/availability/resourcedailyavailability?cartUid=af717bea-6cd8-424d-a695-0595545e4258&resourceId=-2147472382&bookingCategoryId=0&startDate=2021-06-16T00:00:00.000Z&endDate=2021-06-17T00:00:00.000Z&isReserving=true&equipmentId=-32768&subEquipmentId=-32766&boatLength=null&boatDraft=null&boatWidth=null&partySize=3&filterData=%5B%5D&groupHoldUid=';



// Get all resource locations
// These will be used to query for all campgrounds
resourceLocationsList = []
fetch(resourceLocations, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(response => {
    resourceLocationsList = response;
    // console.log(resourceLocationsList);
    // resourceLocationId =  resourceLocationsList[i]['resourceLocationId']
    // resourceLocationName = resourceLocationsList[i]['localizedValues'][0]['fullName']
    // resourceLocationDescription = resourceLocationsList[i]['localizedValues'][0]['description']
    // resourceLocationWebsite = resourceLocationsList[i]['website']
    // resourceLocationStreetAddress = resourceLocationsList[i]['streetAddress']
    // resourceLocationCity = resourceLocationsList[i]['city']
    // resourceLocationPostal = resourceLocationsList[i]['regionCode']
    // resourceLocationPhoneNumber = resourceLocationsList[i]['phoneNumber']
});


// Get resource categories
resourceCategoryList = [];
fetch(resourceCategories, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(response => {
    resourceCategoryList = response;
    // console.log(resourceCategoryList);
    
    // 'name': [i]['localizedValues']['0']['name'],
    // 'resourceCategoryId': [i]['resourceCategoryId'],
    // 'versionId': [i]['versionId']
});


// Get rate categories
rateCategoryList = [];
fetch(rateCategories, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(response => {
    rateCategoryList = response;
    // console.log(rateCategoryList);
    
    // 'rateCategoryId': rateCategoryList[i]['rateCategoryId'],
    // 'name': rateCategoryList[i]['localizedValues'][0]['name']
    // 'description': rateCategoryList[i]['localizedValues'][0]['description']
});


// Get equipment categories
equipmentCategoryList = [];
fetch(equipment, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(response => {
    equipmentList = response;
    // console.log(equipmentList);
    
    subEquipmentCategories = equipmentList[0]['subEquipmentCategories'];
    for (var i=0; i < subEquipmentCategories.length; i++) {
        equipmentCategoryList.push({
            'subEquipmentCategoryId': subEquipmentCategories[i]['subEquipmentCategoryId'],
            'order': subEquipmentCategories[i]['order'],
            'name': subEquipmentCategories[i]['localizedValues'][0]['name']
        }); 
    }
});

