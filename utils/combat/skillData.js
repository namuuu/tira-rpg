const combatUtils = require("../../utils/combatUtils.js");





exports.heal = {
    id: "heal",
    name: "Heal",
    func: function (data, quantity, log) {
        const { casterId, targets } = data;
      
        for(const target of targets) {
          target.health = (target.health + quantity > target.stats.vitality) ? target.stats.vitality : target.health + quantity;
        }
      
        // combatUtils.addToValueTologger(log, casterId, "heal", quantity);
    }
}

exports.physDamage = {
    id: "phys_damage",
    name: "Physical Damage",
    func: function (data, power, log) {
        const { combat, casterId, targets } = data;
      
        const caster = combatUtils.getPlayerInCombat(casterId, combat);
      
        for(const target of targets) {
            const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);
      
            target.health = (target.health - damage < 0) ? 0 : target.health - damage;
            combatUtils.addToValueTologger(log, target.id, "damage", damage);
        }
      }
}

exports.buffStats = {
    id: "buff_stats",
    name: "Buff Stats",
    func: function (data, parameters, log) {
        const { combat, casterId, targets } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        for(const target of targets) {
            if(target.effects["buff-stats"] == undefined) {
                target.effects["buff-stats"] = {situation: "after"};
            }

            for(const [key, value] of Object.entries(parameters[1])) {
                if(target.effects["buff-stats"][key] != undefined) {
                    target.stats[key] -= target.effects["buff-stats"][key].value;
                }
            
                target.effects["buff-stats"][key] = {
                    value: value.value,
                    duration: value.duration,
                };

                target.stats[key] += value.value;
            }
        }
    }
}