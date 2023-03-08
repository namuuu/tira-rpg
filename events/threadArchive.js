const manager = require('../manager/combatManager.js');
const combat = require('../utils/combatUtils.js');

module.exports = {
    name: 'threadUpdate',
    async trigger(interaction) {
        console.log(interaction);

        return; // TO REMOVE, TO PREVENT FROM CRASHES

        if(interaction.locked == false && interaction.archived == false)
            return;

        if(combat.getCombatCollection(interaction.id) != null) {
            manager.deleteCombat(interaction.id);
        }
    }
};