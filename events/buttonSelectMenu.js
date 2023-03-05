const player = require('../utils/playerUtils.js');
const { displayInventory } = require('../utils/inventoryUtils.js');
const { startCombat, addPlayerToCombat } = require('../manager/combatManager.js');
const { acceptInvitation } = require('../utils/partyUtils.js');
const { sendStringAllSkills, sendModal } = require('../utils/skillUtils.js');
const { receiveButton } = require('../utils/equipUtils.js');

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
                displayInventory(userId, interaction); // Displays the inventory of a player (inventoryUtils.js)
                break;
            case 'displaySkills':
                const ret = await sendStringAllSkills(user.username, userId); // Displays all the skills of a player (skillUtils.js)
                interaction.reply(ret);
                break;
            case 'select_skill':
                sendModal(interaction, true, args[0]);
                break;
            case 'unselect_skill':
                sendModal(interaction, false, args[0]);
                break;
            case 'joinFight':
                await addPlayerToCombat(userId, args[0], args[1], interaction); // Adds a player to a combat (combatManager.js)
                break;
            case 'combat_start':
                await startCombat(interaction); // Starts a combat (combatManager.js)
                break;
            case 'party_accept':
                await acceptInvitation(userId, args[0], interaction); // Accepts a party invitation (partyUtils.js)
                break;
            case 'equip':	
                receiveButton(interaction, userId, args); // Personal button handler (equipUtils.js)
            default:
                break;
        }
    }
}