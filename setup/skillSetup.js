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
    skillMap.set("buff_stats", buff_stats);
    skillMap.set("debuff_stats", debuff_stats);
    skillMap.set("poison", poison);
    skillMap.set("burn", burn);

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

function damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.addToValueTologger(log, target.id, "damage", damage);
  }

}

function cooldown(exeData, quantity, log) {
  const { combat, casterId} = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}

function buff_stats(exeData, buffs, log) {
  const { casterId, targets } = exeData;

  for(const buff of buffs) {
    for(const target of targets) {
      target.stats[buff.stat] += buff.value;
      target.effects.push(buff);
    }
  }
}

function debuff_stats(exeData, debuffs, log) {
  const { casterId, targets } = exeData;

  const arrayDebuffs = Object.values(Object.values(debuffs));

  for(const debuff of arrayDebuffs) {
    for(const target of targets) {
      target.stats[debuff.stat] -= debuff.value;
      if (debuff.stat != undefined)
      target.effects[debuff.stat] = debuff;
    }
  }
}

function poison(exeData, poison, log) {
  const { casterId, targets } = exeData;

  console.log('got to poison');

  for(const target of targets) {
    target.effects['poison'] = poison;
  }
}

function burn(exeData, burn, log) {
  const { casterId, targets } = exeData;

  for(const target of targets) {
    target.effects['burn'] = burn;
  }
}