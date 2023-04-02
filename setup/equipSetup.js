const fs = require('fs');
const weapons = new Map();
const helmets = new Map();
const chestplates = new Map();
const boots = new Map();
const equipmentList = [];

module.exports = {
  weapons: weapons,
  helmets: helmets,
  chestplates: chestplates,
  boots: boots,
  equipmentList: equipmentList,
  setupEquipment() {
    console.groupCollapsed("-- Equipment --");
    console.log("Setting up Caracteristics...");
    set("weapons", weapons);
    set("helmets", helmets);
    set("chestplates", chestplates);
    set("boots", boots);

    equipmentList.push(...weapons.values());
    equipmentList.push(...helmets.values());
    equipmentList.push(...chestplates.values());
    equipmentList.push(...boots.values());

    console.log("Equipments are all setup !");
    console.groupEnd();
  },
  
}

function set(json, map) {
    var data = JSON.parse(fs.readFileSync(`./data/equipment/${json}.json`));
    data = Object.entries(data);

    for( var [key, value] of data) {
        map.set(key, value);
    }
}
