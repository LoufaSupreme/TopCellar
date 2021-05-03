
async function main() {
    // Direct API Routes
    const resourceLocationsURL = 'https://reservations.ontarioparks.com/api/resourcelocation/';
    const resourceCategoriesURL = 'https://reservations.ontarioparks.com/api/resourcecategory';
    const equipmentURL = 'https://reservations.ontarioparks.com/api/equipment';
    const rateCategoriesURL = 'https://reservations.ontarioparks.com/api/ratecategory/ratecategories';
    const attributesURL = 'https://reservations.ontarioparks.com/api/attribute/filterable';

    // Call direct API routes
    let resourceLocations_response = await fetch(resourceLocationsURL);
    let resourceLocationsList = await resourceLocations_response.json();

    let resourceCategories_response = await fetch(resourceCategoriesURL);
    let resourceCategoriesList = await resourceCategories_response.json();

    let equipment_response = await fetch(equipmentURL);
    let equipmentList = await equipment_response.json();
    equipmentList = equipmentList[0]['subEquipmentCategories'];
    console.log(equipmentList);

    let rateCategories_response = await fetch(rateCategoriesURL);
    let rateCategoriesList = await rateCategories_response.json();

    let attributes_response = await fetch(attributesURL);
    let attributesList = await attributes_response.json();

    // Get list of all sites within each resource location:
    for (let i = 0; i < resourceLocationsList.length; i++) {
        let resourceLocation = resourceLocationsList[i];
        let resourceLocationId = resourceLocation['resourceLocationId'];
        let allSiteInfoURL = `https://reservations.ontarioparks.com/api/resourcelocation/resources?resourceLocationId=${resourceLocationId}`;
        let allSiteInfo_response = await fetch(allSiteInfoURL);
        let allSiteInfoList = await allSiteInfo_response.json();
        allSiteInfoList = Object.entries(allSiteInfoList);

        // Create resource location header:
        body = document.getElementsByTagName("BODY")[0];
        resourceDiv = document.createElement('div');
        resourceDiv.innerHTML = `[${i}] Resource Location ID: ${resourceLocation['resourceLocationId']}, Name: ${resourceLocation['localizedValues'][0]['fullName']}`;
        body.append(resourceDiv);
        resourceLocationUL = document.createElement('ul');
        resourceDiv.append(resourceLocationUL);    

        // fill in details for each site
        for (let j = 0; j < allSiteInfoList.length; j++) {
            let siteInfo = allSiteInfoList[j];

            siteCategoryName = getCategory(resourceCategoriesList, siteInfo);
            siteFeeScheduleName = getFeeCategory(rateCategoriesList, siteInfo);
            siteEquipmentList = getEquipment(equipmentList, siteInfo);
            siteAttributeList = getAttributes(attributesList, siteInfo);
            addSiteInfo(j, siteInfo, siteCategoryName, siteFeeScheduleName, siteEquipmentList, siteAttributeList);
        }
    }
}

async function justOne() {
    // Direct API Routes
    const resourceLocationsURL = 'https://reservations.ontarioparks.com/api/resourcelocation/';
    const resourceCategoriesURL = 'https://reservations.ontarioparks.com/api/resourcecategory';
    const equipmentURL = 'https://reservations.ontarioparks.com/api/equipment';
    const rateCategoriesURL = 'https://reservations.ontarioparks.com/api/ratecategory/ratecategories';
    const attributesURL = 'https://reservations.ontarioparks.com/api/attribute/filterable';

    // Call direct API routes
    let resourceLocations_response = await fetch(resourceLocationsURL);
    let resourceLocationsList = await resourceLocations_response.json();
    console.log(`resourceLocationsURL: ${resourceLocationsURL}`)

    let resourceCategories_response = await fetch(resourceCategoriesURL);
    let resourceCategoriesList = await resourceCategories_response.json();
    console.log(`resourceCategoriesURL: ${resourceCategoriesURL}`)

    let equipment_response = await fetch(equipmentURL);
    let equipmentList = await equipment_response.json();
    equipmentList = equipmentList[0]['subEquipmentCategories'];
    // console.log(equipmentList);
    console.log(`equipmentURL: ${equipmentURL}`)

    let rateCategories_response = await fetch(rateCategoriesURL);
    let rateCategoriesList = await rateCategories_response.json();
    console.log(`rateCategoriesURL: ${rateCategoriesURL}`)

    let attributes_response = await fetch(attributesURL);
    let attributesList = await attributes_response.json();


    // Fill in site info for each site
    let resourceLocation = resourceLocationsList[1];

    // use Site 76 of Aaron Park Campground B as an example:
    let resourceLocationId = '-2147483648';
    let allSiteInfoURL = `https://reservations.ontarioparks.com/api/resourcelocation/resources?resourceLocationId=${resourceLocationId}`;
    let allSiteInfo_response = await fetch(allSiteInfoURL);
    let allSiteInfoList = await allSiteInfo_response.json();
    allSiteInfoList = Object.entries(allSiteInfoList);


    // Create resource location header:
    body = document.getElementsByTagName("BODY")[0];
    resourceDiv = document.createElement('div');
    resourceDiv.innerHTML = `[1] Resource Location ID: ${resourceLocationId}, Name: ${resourceLocation[resourceLocationId]}`;
    body.append(resourceDiv);
    resourceLocationUL = document.createElement('ul');
    resourceDiv.append(resourceLocationUL);    

    for (let j = 0; j < allSiteInfoList.length; j++) {
        let siteInfo = allSiteInfoList[j];  //23 for site 76

        console.log(`allSiteInfoURL: ${allSiteInfoURL}`);

        siteCategoryName = getCategory(resourceCategoriesList, siteInfo);
        siteFeeScheduleName = getFeeCategory(rateCategoriesList, siteInfo);
        siteEquipmentList = getEquipment(equipmentList, siteInfo);
        siteAttributeList = getAttributes(attributesList, siteInfo);

        addSiteInfo(23, siteInfo, siteCategoryName, siteFeeScheduleName, siteEquipmentList, siteAttributeList);
    }
    // console.log(resourceLocation, resourceCategory, equipment, rateCategory, siteInfo);

    return equipmentList;
}


function getCategory(resourceCategoriesList, siteInfo) {
    const siteCategoryId = siteInfo[1]['resourceCategoryId'];
    for (let i = 0; i < resourceCategoriesList.length; i++) {
        if (resourceCategoriesList[i]['resourceCategoryId'] === siteCategoryId) {
            let siteCategoryName = resourceCategoriesList[i]['localizedValues'][0]['name'];
            return siteCategoryName;
        }
    }
}


function getFeeCategory(rateCategoriesList, siteInfo) {
    const siteFeeScheduleId = siteInfo[1]['feeScheduleId'];
    for (let i = 0; i < rateCategoriesList.length; i++) {
        if (rateCategoriesList[i]['rateCategoryId'] === siteFeeScheduleId) {
            let siteFeeScheduleName = rateCategoriesList[i]['localizedValues'][0]['name'];
            return siteFeeScheduleName;
        }
    }
}


function getEquipment(equipmentList, siteInfo) {
    let siteEquipmentIdList = new Set();
    let siteEquipmentNameList = []
    for (let i = 0; i < siteInfo[1]['allowedEquipment'].length; i++) {
        siteEquipmentIdList.add(siteInfo[1]['allowedEquipment'][i]['item1']);
        siteEquipmentIdList.add(siteInfo[1]['allowedEquipment'][i]['item2']);
    }
    for (let i = 0; i < equipmentList.length; i++) {
        for (let siteEquipmentId of siteEquipmentIdList) {
            if (equipmentList[i]['subEquipmentCategoryId'] === siteEquipmentId) {
                siteEquipmentNameList.push(equipmentList[i]['localizedValues'][0]['name']);
            }
        }
    }
    // console.log(siteEquipmentIdList);
    // console.log(siteEquipmentNameList);
    return siteEquipmentNameList;
}


function getAttributes(attributesList, siteInfo) {
    let siteAttributeNameList = []

    // loop through all of the site's listed attributes:
    siteAttributeList = siteInfo[1]['definedAttributes'];
    // console.log(siteAttributeList, siteAttributeList.length);
    for (let i = 0; i < siteAttributeList.length; i++) {
        // find site's attribute definition ID:
        attributeId = siteInfo[1]['definedAttributes'][i]['attributeDefinitionId'];
        // console.log(`Attr ID: ${attributeId}`);

        // find site's attribute values for this attribute:
        // check for multiple attribute values:
        if (siteInfo[1]['definedAttributes'][i]['value']) {
            siteListedAttrValues = siteInfo[1]['definedAttributes'][i]['value'];
        } else {
            siteListedAttrValues = siteInfo[1]['definedAttributes'][i]['values'];
        }
        
        // lookup attribute definition ID in attributesList:
        attributeName = attributesList[attributeId]['localizedValues'][0]['displayName'];
        // console.log(`Attribute Name: ${attributeName}`);
        // lookup values associated with this attribute:
        // check if attribute can have multiple possible values, i.e. has an "isMultiSelect" element:
        attributeValueNames = [];
        if (attributesList[attributeId].hasOwnProperty('isMultiSelect')) {
            // console.log('multiSelect');
            for (let k = 0; k < attributesList[attributeId]['values'].length; k++) {
                for (let l = 0; l < siteListedAttrValues.length; l++){
                    attributeValueId = attributesList[attributeId]['values'][k]['enumValue'];
                    if (attributeValueId === siteListedAttrValues[l]) {
                        attributeValueNames.push(attributesList[attributeId]['values'][k]['localizedValues'][0]['displayName']);
                    }    
                }
            }
        } 
        // otherwise just take the value right out of the site's attribute value
        else {
            attributeValueNames.push(siteListedAttrValues);
        }
        // console.log(`Attribute Value Names: ${attributeValueNames}`);

        siteAttributeNameList.push({
            key: attributeName,
            value: attributeValueNames
        });
    }
    // console.log(siteAttributeNameList);
   return siteAttributeNameList;
}


function addSiteInfo(index, siteInfo, siteCategoryName, siteFeeScheduleName, siteEquipmentList, siteAttributeList) {
    // body = document.getElementsByTagName("BODY")[0];

    // resourceDiv = document.createElement('div');
    // resourceDiv.innerHTML = `Resource Location ID: ${resourceLocation['resourceLocationId']}, Name: ${resourceLocation['localizedValues'][0]['fullName']}`;
    // body.append(resourceDiv);

    // resourceLocationUL = document.createElement('ul');
    // resourceDiv.append(resourceLocationUL);    

    siteTitle = document.createElement('li');
    siteTitle.innerHTML = `[${index}] Site ID: ${siteInfo[0]}`;
    resourceLocationUL.append(siteTitle);

    siteUL = document.createElement('ul');
    resourceLocationUL.append(siteUL);

    siteResourceLocationId = document.createElement('li');
    siteResourceLocationId.innerHTML = `Site Resource Location ID: ${siteInfo[1]['resourceLocationId']}`;
    siteUL.append(siteResourceLocationId);

    siteResourceId = document.createElement('li');
    siteResourceId.innerHTML = `Site Resource ID: ${siteInfo[1]['resourceId']}`;
    siteUL.append(siteResourceId);

    siteName = document.createElement('li');
    siteName.innerHTML = `Name: ${siteInfo[1]['localizedValues'][0]['name']}`;
    siteUL.append(siteName);
    
    siteDescription = document.createElement('li');
    siteDescription.innerHTML = `Description: ${siteInfo[1]['localizedValues'][0]['description']}`;
    siteUL.append(siteDescription);
    
    siteFeeScheduleId = document.createElement('li');
    siteFeeScheduleId.innerHTML = `Fee Schedule: ${siteFeeScheduleName} (ID: ${siteInfo[1]['feeScheduleId']})`;
    siteUL.append(siteFeeScheduleId);
    
    siteMaxCap = document.createElement('li');
    siteMaxCap.innerHTML = `Max Capacity: ${siteInfo[1]['maxCapacity']}`;
    siteUL.append(siteMaxCap);
    
    siteDateScheduleId = document.createElement('li');
    siteDateScheduleId.innerHTML = `Date Schedule ID: ${siteInfo[1]['dateScheduleId']}`;
    siteUL.append(siteDateScheduleId);

    siteAllowedEquip = document.createElement('li');
    siteAllowedEquip.innerHTML = `Allowed Equipment: ${siteEquipmentList}`;
    siteUL.append(siteAllowedEquip);

    // eq_list = document.querySelector('#eq-list');
    // for (let i = 0; i < siteEquipmentList.length; i++) {
    //     eq_list.insertAdjacentHTML('afterbegin',siteEquipmentList[i]);
    // }

    siteDefinedAttr = document.createElement('li');
    siteDefinedAttr.innerHTML = `Defined Attributes:`;
    siteUL.append(siteDefinedAttr);

    siteDefinedAttrUL = document.createElement('ul');
    siteDefinedAttr.append(siteDefinedAttrUL);

    for (let dict of siteAttributeList) {
        // for (const [key, value] of Object.entries(dict)) {        
            siteAttr = document.createElement('li');
            siteAttr.innerHTML = `${dict['key']}: ${dict['value']}`;
            siteDefinedAttrUL.append(siteAttr);
        // }
    
    }

    siteResourceCategoryId = document.createElement('li');
    siteResourceCategoryId.innerHTML = `Resource Category: ${siteCategoryName} (ID: ${siteInfo[1]['resourceCategoryId']})`;
    siteUL.append(siteResourceCategoryId);


}


