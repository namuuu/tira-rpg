const combatUtils = require("../combatUtils.js");





exports.heal = {
    id: "heal",
    name: "Heal",
    func: function (data, params, log) {
        const { casterId, targets } = data;
      
        for(const target of targets) {
            const quantity = params.value;

            if(params.type == "percentage-full")
                quantity = Math.floor(target.max_health * params.value / 100);

            if(params.type == "percentage-current")
                quantity = Math.floor(target.health * params.value / 100);

            target.health = (target.health + quantity > target.max_health) ? target.stats.vitality : target.health + quantity;
        }
      
        // combatUtils.addToValueTologger(log, casterId, "heal", quantity);
    }
}

exports.physDamage = {
    id: "phys_damage",
    name: "Physical Damage",
    func: function (data, power) {
        const { combat, casterId, targets, log } = data;

        console.log(data);
      
        const caster = combatUtils.getPlayerInCombat(casterId, combat);
      
        for(const target of targets) {
            const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);
      
            target.health = (target.health - damage < 0) ? 0 : target.health - damage;
            combatUtils.log.addInteger(log, target.id, "damage", damage);
        }
      }
}

exports.buffStats = {
    id: "buff_stats",
    name: "Buff Stats",
    func: function (data, parameters) {
        const { combat, casterId, targets } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        console.log("Buffing stats:");
        console.log(parameters);

        for(const target of targets) {
            if(target.effects["buff-stats"] == undefined) {
                target.effects["buff-stats"] = {situation: "after"};
            }

            for(const [key, value] of Object.entries(parameters[1])) {
                if(target.effects["buff-stats"][key] != undefined) {
                    target.stats[key] -= target.effects["buff-stats"][key].value;
                }

                if(value.type == "percent") {
                    value.value = Math.floor(target.stats[key] * value.value / 100);
                }
            
                target.effects["buff-stats"][key] = {
                    value: value.value,
                    duration: value.duration,
                };

                target.stats[key] += value.value;
            }
        }
    }
},

exports.holyThrust = {
    id: "holy_thrust",
    name: "Holy Thrust",
    func: function (data, power) {
        const { combat, casterId, targets, log } = data;
      
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        if(caster.effects["solar-gauge"].value < 10) {
            combatUtils.log.add(log, casterId, "failed", 0);
            return;
        }

        caster.effects["solar-gauge"].value -= 10;
      
        for(const target of targets) {

            const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

            caster.effects["solar-gauge"].value += Math.floor(damage / 3);
      
            target.health = (target.health - damage < 0) ? 0 : target.health - damage;
            combatUtils.log.addInteger(log, target.id, "damage", damage);
        }
    }
}

exports.restlessStab = {
    id: "restless_stab",
    name: "Restless Stab",
    func: function (data, power ) {
        const { combat, casterId, targets } = data;
      
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        for(const target of targets) {
            const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

            if(caster.timeline > target.timeline + 40)
                damage *= 1.7;

            target.health = (target.health - damage < 0) ? 0 : target.health - damage;
        }
    }
}

exports.slow = {
    id: "slow",
    name: "Slow",
    func: function (data, parameters) {
        const { combat, casterId, targets } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        for(const target of targets) {
            const difference = caster.timeline - target.timeline;

            target.timeline += Math.floor(difference * 1.2);
            caster.timeline -= Math.floor(difference * 1.5);
        }
    }
},

exports.brushCut = {
    id: "brush_cut",
    name: "Brush Cut",
    func: function (data, power) {
        const { combat, casterId, targets, log } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);
        let damage;

        for(const target of targets) {
            if(target.effects["paint"] == undefined) {
                target.effects["paint"] = {value: 1};
                damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);
            } else {
                delete target.effects["paint"];
                damage = Math.floor((power + 3 * (caster.stats.strength / target.stats.resistance) + 2) / 2);
            }

            target.health = (target.health - damage < 0) ? 0 : target.health - damage;

            combatUtils.log.addInteger(log, target.id, "damage", damage);
        }
    }
}

exports.decoloration = {
    id: "decoloration",
    name: "Decoloration",
    func: function (data) {
        const { combat, casterId, targets, log } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        for(const target of targets) {
            if(target.effects["paint"] != undefined) {
                if(target.effects["paint"].value == 1) {
                    exports.buffStats(data, [{}, {resistance: {value: -13, duration: 1}}], log);
                } else {
                    exports.buffStats(data, [{}, {resistance: {value: -13, duration: 2}}], log);
                }

                delete target.effects["paint"];
            }
        }
    }
}

exports.splatter = {
    id: "splatter",
    name: "Splatter",
    func: function (data, power) {
        const { combat, casterId, targets, log } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        const effective = false;

        for(const target of targets) {
            if(target.effects["paint"] != undefined && target.effects["paint"].value >= 2) {
                effective = true;

                target.effects["paint"].value -= 2;

                if(target.effects["paint"].value <= 0) {
                    delete target.effects["paint"];
                }

                const damage = Math.floor((power * (caster.stats.strength / target.stats.resistance) + 2) / 2);

                target.health = (target.health - damage < 0) ? 0 : target.health - damage;

                combatUtils.log.addInteger(log, target.id, "damage", damage);
            }
        }
    }
}

exports.paintFestival = {
    id: "paint_festival",
    name: "Paint Festival",
    func: function (data) {
        const { combat, casterId, targets } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        for(const target of targets) {
            if(target.id == casterId)
                continue;

            if(target.effects["paint"] == undefined) {
                target.effects["paint"] = {value: 1};
            } else {
                target.effects["paint"].value += 1;
            }
        }
    }
}

exports.selfDamage = {
    id: "self_damage",
    name: "Self Damage",
    func: function (data, params) {
        const { combat, casterId, targets, log } = data;
        const caster = combatUtils.getPlayerInCombat(casterId, combat);

        // If the caster is already below the threshold, don't do anything
        if(params.until != undefined && caster.max_health * (params.until / 100) > caster.health)
            return;

        const damage = params.value;

        if(params.type = "percentage")
            damage = Math.floor(caster.max_health * (damage / 100));

        caster.health = caster.health - damage;

        if(params.untilDeath == false && caster.health < 0) {
            damage += caster.health;
            caster.health = 1;
        }

        if(caster.health < 0)
            caster.health = 0;

        combatUtils.log.addInteger(log, casterId, "damage", damage);
    }
}   