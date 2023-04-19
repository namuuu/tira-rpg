const abilityMap = new Map();
const combatUtils = require('../utils/combatUtils.js');
const abilityData = require('../utils/combat/abilityData.js');

module.exports = {
  map: abilityMap,
  setupAbilities() {
    console.groupCollapsed("-- Abilities --");
    console.log("Setting up Abilities...");

    for(const ability of Object.values(abilityData)) {
      abilityMap.set(ability.id, ability.func);
      console.log(`> Ability ${ability.name} setup !`);
    }

    abilityMap.set("mag_damage", mag_damage);
    abilityMap.set("phys_to_mag_damage", phys_to_mag_damage);
    abilityMap.set("mag_to_phys_damage", mag_to_phys_damage);
    abilityMap.set("cooldown", cooldown);
    abilityMap.set("debuff_stats", debuff_stats);
    abilityMap.set("poison", poison);
    abilityMap.set("burn", burn);
    abilityMap.set("phys_low_health_damage", phys_low_health_damage);

    console.log("Abilities are all setup !");
    console.groupEnd();
  },
  
}

function phys_to_mag_damage(exeData, power) {
  const { combat, casterId, targets, log} = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.strength / Math.max(1,target.stats.spirit) + 2)) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function mag_to_phys_damage(exeData, power) {
  const { combat, casterId, targets, log } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.intelligence / Math.max(1,target.stats.resistance)) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function mag_damage(exeData, power) {
  const { combat, casterId, targets, log } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((power * (caster.stats.intelligence / Math.max(1,target.stats.spirit)) + 2) / 2);

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.add(log, target.id, "damage", damage);
  }
}

function phys_low_health_damage(exeData, quantity) {
  const { combat, casterId, targets, log} = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  for(const target of targets) {
      const damage = Math.floor((quantity * (caster.stats.strength / Math.max(1,target.stats.resistance)) + 2) / 2);

      if(target.health < target.max_health * 0.15) {
        damage = Math.floor(damage * 2);
      }

      target.health = (target.health - damage < 0) ? 0 : target.health - damage;
      combatUtils.log.addInteger(log, target.id, "damage", damage);
  }
}

function earnSolarGauge(exeData, quantity) {
  const { casterId } = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);

  caster.effects["solar-gauge"] += quantity;
}

function cooldown(exeData, quantity) {
  const { combat, casterId} = exeData;

  const caster = combatUtils.getPlayerInCombat(casterId, combat);
  caster.timeline += quantity;
}

function debuff_stats(exeData, debuffs) {
  const { casterId, targets } = exeData;

  const arrayDebuffs = Object.values(Object.values(debuffs));

  for(const debuff of arrayDebuffs) {
    for(const target of targets) {
      target.stats[debuff.stat] -= debuff.value;
      target.effects[debuff.stat] = debuff;
    }
  }
}

function poison(exeData, poison) {
  const { targets } = exeData;

  for(const target of targets) {
    target.effects['poison'] = poison;
  }
}

function burn(exeData, burn) {
  const { targets } = exeData;

  for(const target of targets) {
    target.effects['burn'] = burn;
  }
}