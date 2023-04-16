const fs = require("fs");
const player = require('../utils/playerUtils.js');
const inventory = require('../utils/inventoryUtils.js');
const selector = require('../utils/messageTemplateUtils.js');
const shopsData = require('../data/shops.json');
const { displayInventory } = require('../utils/inventoryUtils.js');
const { startCombat, addPlayerToCombat, removePlayerFromCombat } = require('../manager/combatManager.js');
const { acceptInvitation } = require('../utils/partyUtils.js');
const { sendStringAllAbilities, sendModal } = require('../utils/abilityUtils.js');
const { receiveButton } = require('../utils/equipUtils.js');

const buttons = new Map();

module.exports = {
    name: 'interactionCreate',
    async setupButtons(client) {
        const eventFiles = fs.readdirSync("./interactions/buttons").filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const button = require(`./../interactions/buttons/${file}`);
            buttons.set(button.name, button);
        }

    },
    async trigger(interaction, client) {
        if(interaction.message.author.id != client.user.id) return;
        if (!interaction.isButton()) return;
	    
        const { user, customId } = interaction;
        const userId = user.id;

        const args = customId.split('-');
        const command = args.shift();

        // The only button supported without a player is the welcome button
        if(command == "welcome") {
            buttons.get(command).interact(interaction, args);
            return;
        }

        if(!(await player.doesExists(user.id))) return;

        // console.log("Command: " + command);
        // console.log("Args: " + args);

        switch(command) {
            case 'displayInventory':
                displayInventory(userId, interaction); // Displays the inventory of a player (inventoryUtils.js)
                return;
            case 'displayAbilities':
                const ret = await sendStringAllAbilities(user.username, userId); // Displays all the abilities of a player (abilityUtils.js)
                interaction.reply(ret);
                return;
            case 'selectAbility':
                sendModal(interaction, true, args[0]);
                return;
            case 'unselectAbility':
                sendModal(interaction, false, args[0]);
                return;
            case 'joinFight':
                var energy = await player.getData(userId, "info");
                energy = energy.energy;

                if(energy > 100000) {
                    interaction.channel.send("You don't have enough energy to join a fight ! " + "<@" + interaction.user.id + ">");
                    return;
                } else {
                    await player.energy.set(userId, energy - 1);
                }
                await addPlayerToCombat(user, args[0], args[1], interaction); // Adds a player to a combat (combatManager.js)
                return;
            case 'leaveFight':
                player.energy.add(userId, 1);
                await removePlayerFromCombat(userId, args[0], interaction); // Removes a player from a combat (combatManager.js)
                return;
            case 'combat_start':
                await startCombat(interaction); // Starts a combat (combatManager.js)
                return;
            case 'party_accept':
                await acceptInvitation(userId, args[0], interaction); // Accepts a party invitation (partyUtils.js)
                return;
            case 'equip':	
                receiveButton(interaction, userId, args); // Personal button handler (equipUtils.js)
                return;
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

                var buy = await player.takeMoney(interaction.user.id, shopsData[shop].items[currentItem].cost * currentQuantity, interaction.message);

                if(!buy) {
                    await interaction.message.delete(); 
                    selector.generateShopItemsSelector(interaction, shop, "0", "0");
                    break;
                }

                await inventory.giveItem(interaction.user.id, currentItem, currentQuantity);

                interaction.channel.send("You bought " + currentQuantity + " " + shopsData[shop].items[currentItem].name + " ! " + "<@" + interaction.user.id + ">");

                await interaction.message.delete(); 

                selector.generateShopItemsSelector(interaction, shop, "0", "0");
            return;
            default:
                break;
        }

        if(buttons.has(command)) {
            buttons.get(command).interact(interaction, args);
        }
    }
}