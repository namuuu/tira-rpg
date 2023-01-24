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

function heal(exeData, quantity, log) {
}

function damage(exeData, quantity, log) {
  const { combat, targetId, thread } = exeData;

  const target = combatUtils.getPlayerInCombat(targetId, combat);
  target.health -= quantity;

  if(combatUtils.getLogger(log, targetId).damage == undefined)
    combatUtils.getLogger(log, targetId).damage = quantity;
  else
    combatUtils.getLogger(log, targetId).damage += quantity;
}

function cooldown(exeData, quantity, log) {
  const { combat, casterId, thread } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}