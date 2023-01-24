const skillMap = new Map();
const combatUtils = require('../utils/combatUtils.js');

module.exports = {
  map: skillMap,
  setupSkills() {
    console.log("-- SKILLS --");
    console.log("Setting up Skills...");
    skillMap.set("heal", heal);
    skillMap.set("damage", damage);
    skillMap.set("cooldown", cooldown);

    console.log("Skills are all setup !");
  },
  
}

function heal(exeData, quantity, result) {
  exeData.thread.send("Healed " + quantity);
}

function damage(exeData, quantity, result) {
  const { combat, targetId, thread } = exeData;
  thread.send("Damaged " + quantity);

  const target = combatUtils.getPlayerInCombat(targetId, combat);
  target.health -= quantity;
}

function cooldown(exeData, quantity, result) {
  const { combat, casterId, thread } = exeData;
  thread.send("Cooldown " + quantity);

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}