const player = require('../utils/playerUtils.js');
const inventory = require('../utils/inventoryUtils.js');
const combat = require('../manager/combatManager.js');
const party = require('../utils/partyUtils.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        if(interaction.message.author.id != client.user.id) return;
        if (!interaction.isButton()) return;
	    
        const { user, customId } = interaction;
        const userId = user.id;

        const args = customId.split('-');
        const command = args.shift();

        if(!(await player.doesExists(user.id))) return;

        // console.log("Command: " + command);
        // console.log("Args: " + args);

        switch(command) {
            case 'displayInventory':
                inventory.displayInventory(userId, interaction);
                break;
            case 'joinFight':
                await combat.addPlayerToCombat(userId, args[0], args[1], interaction.message);
                interaction.reply({ content: 'You have joined the combat!', ephemeral: true });
                break;
            case 'party_accept':
                await party.acceptInvitation(userId, args[0], interaction);
            default:
                break;
        }
    }
}