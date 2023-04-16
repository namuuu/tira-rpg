

exports.poison = {
    id: "poison",
    proc: function(exeData, player, value) {
        const { combat } = exeData;

        const caster = getPlayer(player.id, combat);
        
        caster.health = caster.health-value.value;

        if(caster.health <= 0) {
            caster.health = 1;
        }
    }
}

exports.burn = {
    id: "burn",
    proc: function(exeData, player, value) {
        const { combat } = exeData;

        const caster = getPlayer(player.id, combat);
        
        caster.health = caster.health-value.value;

        if(caster.health <= 0) {
            caster.health = 1;
        }
    }
}

exports["solar-gauge"] = {
    id: "solar-gauge",
    proc: function(exeData, player, value) {
        const { combat } = exeData;

        const caster = getPlayer(player.id, combat);
        
        caster.effects["solar-gauge"].value += 10;
    }
}

exports["lunar-gauge"] = {
    id: "lunar-gauge",
    proc: function(exeData, player, value) {
        const { combat } = exeData;

        const caster = getPlayer(player.id, combat);
        
        caster.effects["lunar-gauge"].value += 20;
    }
}

exports["buff-stats"] = {
    id: "buff-stats",
    proc: function(exeData, player, value) {
        const { combat } = exeData;

        const caster = getPlayer(player.id, combat);

        for(const {stat, val} of Object.entries(caster.stats)) {
            if(value[stat] != undefined && value[stat].duration == 0) {
                caster.stats[stat] -= val;
                delete caster.effects["buff-stats"][stat];
            }
        }
    }
}




function getPlayer(id, combat) {
    if(combat.team1.find(player => player.id === id)) {
        return combat.team1.find(player => player.id === id);
    } else {   
        return combat.team2.find(player => player.id === id);
    }
}