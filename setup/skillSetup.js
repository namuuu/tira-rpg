const skillMap = new Map();
const combatUtils = require('../utils/combatUtils.js');
const skillData = require('../utils/combat/skillData.js');

module.exports = {
  map: skillMap,
  setupSkills() {
    console.groupCollapsed("-- Skills --");
    console.log("Setting up Skills...");

    for(const skill of Object.values(skillData)) {
      skillMap.set(skill.id, skill.func);
      console.log(`> Skill ${skill.name} setup !`);
    }

    skillMap.set("mag_damage", mag_damage);
    skillMap.set("phys_to_mag_damage", phys_to_mag_damage);
    skillMap.set("mag_to_phys_damage", mag_to_phys_damage);
    skillMap.set("cooldown", cooldown);
    skillMap.set("debuff_stats", debuff_stats);
    skillMap.set("poison", poison);
    skillMap.set("burn", burn);

    console.log("Skills are all setup !");
    console.groupEnd();
  },
  
}

// function heal(exeData, quantity, log) {
//   const { casterId, targets } = exeData;

//   for(const target of targets) {
//     target.health = (target.health + quantity > target.stats.vitality) ? target.stats.vitality : target.health + quantity;
//   }

//   combatUtils.addToValueTologger(log, casterId, "heal", quantity);
// }

// function phys_damage(exeData, power, log) {
//   const { combat, casterId, targets } = exeData;

//   const caster = combatUtils.getPlayerInCombat(casterId, combat);

//   for(const target of targets) {
//       const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

//       target.health = (target.health - damage < 0) ? 0 : target.health - damage;
//       combatUtils.addToValueTologger(log, target.id, "damage", damage);
//   }
// }

function phys_to_mag_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.strength / target.stats.spirit) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function mag_to_phys_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.intelligence / target.stats.resistance) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function mag_damage(exeData, power, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.intelligence / target.stats.spirit) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function phys_low_health_damage(exeData, quantity, log) {
  const { combat, casterId, targets } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((quantity * (caster.stats.strength / target.stats.resistance) + 2) / 2);

      if(target.health < target.max_health * 0.15) {
        damage = Math.floor(damage * 2);
      }

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function earnSolarGauge(exeData, quantity, log) {
  const { casterId } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  caster.effects["solar-gauge"] += quantity;
}

function cooldown(exeData, quantity, log) {
  const { combat, casterId} = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}

function debuff_stats(exeData, debuffs, log) {
  const { casterId, targets } = exeData;

  const arrayDebuffs = Object.values(Object.values(debuffs));

  for(const debuff of arrayDebuffs) {
    for(const target of targets) {
      target.stats[debuff.stat] -= debuff.value;
      target.effects[debuff.stat] = debuff;
    }
  }
}

function poison(exeData, poison, log) {
  const { targets } = exeData;

  for(const target of targets) {
    target.effects['poison'] = poison;
  }
}

function burn(exeData, burn, log) {
  const { targets } = exeData;

  for(const target of targets) {
    target.effects['burn'] = burn;
  }
}