const skillMap = new Map();
const { ConnectionService } = require('discord.js');
const combatUtils = require('../utils/combatUtils.js');

module.exports = {
  map: skillMap,
  setupSkills() {
    console.groupCollapsed("-- Skills --");
    console.log("Setting up Skills...");
    skillMap.set("heal", heal);
    skillMap.set("damage", damage);
    skillMap.set("cooldown", cooldown);

    console.log("Skills are all setup !");
    console.groupEnd();
  },
  
}

function heal(exeData, quantity, log) {
}

function damage(exeData, power, log) {
  const { combat, targetId, casterId } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  const target = combatUtils.getPlayerInCombat(targetId, combat);
  
  const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

  target.health -= damage;

  combatUtils.addToValueTologger(log, targetId, "damage", damage);
}

function cooldown(exeData, quantity, log) {
  const { combat, casterId, thread } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}