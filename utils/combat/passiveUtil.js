

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
    onEnd: function(exeData, player, value) {
        const { combat } = exeData;

        const caster = getPlayer(player.id, combat);

        console.log(value);
    }
}




function getPlayer(id, combat) {
    if(combat.team1.find(player => player.id === id)) {
        return combat.team1.find(player => player.id === id);
    } else {   
        return combat.team2.find(player => player.id === id);
    }
}