
const resourceLocationsURL = 'https://reservations.ontarioparks.com/api/resourcelocation/';
const equipmentURL = 'https://reservations.ontarioparks.com/api/equipment';

let equipment_response = await fetch(equipmentURL);
let equipmentList = await equipment_response.json();
equipmentList = equipmentList[0]['subEquipmentCategories'];



function getEquipment(equipmentList, siteInfo) {
    let siteEquipmentIdList = []
    let siteEquipmentNameList = []
    for (let i = 0; i < siteInfo[1]['allowedEquipment'].length; i++) {
        for (let j = 0; j < 2; j++) {
            siteEquipmentIdList.push(siteInfo[1]['allowedEquipment'][i][j]);
        }
    }
    for (let i = 0; i < equipmentList.length; i++) {
        for (let j = 0; j < siteEquipmentIdList.length; j++) {
            if (equipmentList[i]['subEquipmentCategoryId'] === siteEquipmentIdList[j]) {
                siteEquipmentNameList.push(equipmentList[i]['localizedValues'][0]['name']);
            }
        }
    }
    console.log(siteEquipmentIdList);
    console.log(siteEquipmentNameList);
    return siteEquipmentNameList;
}