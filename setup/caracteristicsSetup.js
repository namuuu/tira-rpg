const caracteristics = new Map();
const combatUtils = require('../utils/combatUtils.js');

module.exports = {
  map: caracteristics,
  setupCaracteristics() {
    console.log("-- CARACTERISTICS --");
    console.log("Setting up Caracteristics...");
    caracteristics.set("heal", {func: strengh_raw_buff});

    console.log("Caracteristics are all setup !");
  },
}

function strengh_raw_buff() {
}
