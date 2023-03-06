const player = require('../utils/playerUtils.js');
const inventory = require('../utils/inventoryUtils.js');
const selector = require('../utils/messageTemplateUtils.js');
const shopsData = require('../data/shops.json');
const { displayInventory } = require('../utils/inventoryUtils.js');
const { startCombat, addPlayerToCombat } = require('../manager/combatManager.js');
const { acceptInvitation } = require('../utils/partyUtils.js');
const { sendStringAllSkills, sendModal } = require('../utils/skillUtils.js');

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
            case 'buyItem':

                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to shop with your own character, please use the t.shop commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                if (interaction.message.components[1] != undefined) {
                    interaction.channel.send("Please select an item and a quantity to buy ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                var currentQuantity = interaction.message.components[0].components[0].customId.split('-')[4];
                var currentItem = interaction.message.components[0].components[0].customId.split('-')[3];
                var shop = interaction.message.components[0].components[0].customId.split('-')[2];

                var buy = player.takeMoney(interaction.user.id, shopsData[shop].items[currentItem].cost * currentQuantity, interaction.message);

                if(!buy) {
                    await interaction.message.delete(); 
                    selector.generateShopItemsSelector(interaction, shop, "0", "0");
                    break;
                }

                await inventory.giveItem(interaction.user.id, currentItem, currentQuantity);

                interaction.channel.send("You bought " + currentQuantity + " " + shopsData[shop].items[currentItem].name + " ! " + "<@" + interaction.user.id + ">");

                await interaction.message.delete(); 

                selector.generateShopItemsSelector(interaction, shop, "0", "0");
            break;
            default:
                break;
        }
    }
}