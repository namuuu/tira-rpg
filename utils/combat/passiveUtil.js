

exports.poison = {
    name: "poison",
    proc: function(exeData, player, value) {
        const { combat, casterId, targets } = exeData;

        const caster = getPlayer(casterId, combat);
        
        caster.health--;

        if(caster.health <= 0) {
            caster.health = 1;
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