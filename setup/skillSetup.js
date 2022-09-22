const skillMap = new Map();

module.exports = {
  map: skillMap,
  setupSkills(client) {
    skillMap.set("heal", heal);
    skillMap.set("damage", damage);
  },
  
}

function heal(channel, combatId, quantity) {
  console.log("Healed " + quantity);
}

function damage(channel, combatid, quantity) {
  console.log("Damaged " + quantity);
}