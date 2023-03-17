const skillMap = new Map();
const { ConnectionService } = require('discord.js');
const combatUtils = require('../utils/combatUtils.js');

module.exports = {
  map: skillMap,
  setupSkills() {
    console.groupCollapsed("-- Skills --");
    console.log("Setting up Skills...");
    skillMap.set("heal", heal);
    skillMap.set("phys_damage", phys_damage);
    skillMap.set("mag_damage", mag_damage);
    skillMap.set("phys_to_mag_damage", phys_to_mag_damage);
    skillMap.set("mag_to_phys_damage", mag_to_phys_damage);
    skillMap.set("cooldown", cooldown);

    console.log("Skills are all setup !");
    console.groupEnd();
  },
  
}

function heal(exeData, quantity, log) {
  const { casterId, targets } = exeData;

  for(const target of targets) {
    target.health = (target.health + quantity > target.stats.vitality) ? target.stats.vitality : target.health + quantity;
  }

  combatUtils.addToValueTologger(log, casterId, "heal", quantity);
}

function phys_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.addToValueTologger(log, target.id, "damage", damage);
  }
}

function phys_to_mag_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.strength / target.stats.spirit) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.addToValueTologger(log, target.id, "damage", damage);
  }
}

function mag_to_phys_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.intelligence / target.stats.resistance) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.addToValueTologger(log, target.id, "damage", damage);
  }
}

function mag_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.intelligence / target.stats.spirit) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.addToValueTologger(log, target.id, "damage", damage);
  }
}

function cooldown(exeData, quantity, log) {
  const { combat, casterId} = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}