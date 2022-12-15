const skillMap = new Map();

module.exports = {
  map: skillMap,
  setupSkills() {
    console.log("-- SKILLS --");
    console.log("Setting up Skills...");
    skillMap.set("heal", heal);
    skillMap.set("damage", damage);

    console.log("Skills are all setup !");
  },
  
}

function heal(channel, combatId, quantity) {
  channel.send("Healed " + quantity);
}

function damage(channel, combatid, quantity) {
  channel.send("Damaged " + quantity);
}