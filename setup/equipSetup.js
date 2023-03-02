const fs = require('fs');
const weapons = new Map();
const helmets = new Map();
const chestplates = new Map();
const boots = new Map();

module.exports = {
  weapons: weapons,
  helmets: helmets,
  chestplates: chestplates,
  boots: boots,
  setupEquipment() {
    console.log('\u001b[' + 32 + 'm' + "-- EQUIPMENT --"+ '\u001b[0m');
    console.log("Setting up Caracteristics...");
    set("weapons", weapons);
    set("helmets", helmets);
    set("chestplates", chestplates);
    set("boots", boots);

    console.log("Equipments are all setup !");
  },
  
}

function set(json, map) {
    var data = JSON.parse(fs.readFileSync(`./data/equipment/${json}.json`));
    data = Object.entries(data);

    for( var [key, value] of data) {
        map.set(key, value);
    }
}
