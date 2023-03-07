const caracteristics = new Map();
const combatUtils = require('../utils/combatUtils.js');

module.exports = {
  map: caracteristics,
  setupCaracteristics() {
    console.groupCollapsed("-- Caracteristics --");
    console.log("Setting up Caracteristics...");
    caracteristics.set("heal", {func: strengh_raw_buff});

    console.log("Caracteristics are all setup !");
    console.groupEnd();
  },
}

function strengh_raw_buff() {
}
