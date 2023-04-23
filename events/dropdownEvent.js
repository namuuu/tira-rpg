const player = require('../utils/playerUtils.js');
const inv = require('../utils/inventoryUtils.js');
const selector = require('../utils/messageTemplateUtils.js');
const { EmbedBuilder } = require('discord.js');
const combat = require('../utils/combatUtils.js');
const fs = require('fs');

const sliders = new Map();

module.exports = {
    name: 'interactionCreate',
    async setupStringSelect() {
        const eventFiles = fs.readdirSync("./interactions/stringSelect").filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const stringSelect = require(`./../interactions/stringSelect/${file}`);
            sliders.set(stringSelect.name, stringSelect);
        }

    },
    async trigger(interaction) {
        if (!interaction.isStringSelectMenu()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        const args = customId.split('-');
        const command = args.shift();

        //console.log(command);
        //console.log(args);

        switch(command) {
            case 'displayInventory':
                if(!(await player.doesExists(user.id))) return;
                inv.displayInventory(authorId, interaction);
                break;
            case 'inventory_selector':
                if(!(await player.doesExists(user.id)) || user.id != args[0]) return;
                inv.display(user, interaction, interaction.values[0], true);
                break;
            case 'combat_ability_selector':
                if(!(await player.doesExists(user.id))) return;
                combat.receiveAbilitySelector(interaction);
                break;
            case 'combat_target_selector':
                if(!(await player.doesExists(user.id))) return;
                combat.receiveTargetSelector(interaction);
                break;
            case 'classChoice':
                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to start your own adventure, please use the t.init commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                await interaction.message.delete();

                player.create(interaction.user.id, interaction.values[0]);

                var playerClass = JSON.parse(fs.readFileSync('./data/classes.json'))
                
                const displayEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`:crossed_swords:  ${interaction.user.username}, you are a ${playerClass[interaction.values[0]].name} now !  :crossed_swords:`)
                .addFields( 
                    { name: 'This is it... The beginning', value: "Are you ready for a whole new adventure ?" }
                )
                .setThumbnail(interaction.user.displayAvatarURL());
            
                await interaction.channel.send({embeds: [displayEmbed]});
                break;
            case 'shopChoice':
                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to shop with your own character, please use the t.shop commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                selector.generateShopItemsSelector(interaction, interaction.values[0], "0", "0");

                await interaction.message.delete();

                break;
            case 'shopItemChoice':
                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to shop with your own character, please use the t.shop commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                if (interaction.message.components[2] == undefined) {
                    var quantity = interaction.message.components[1].components[0].customId.split('-')[4];
                    var shop = interaction.message.components[1].components[0].customId.split('-')[2];
                } else {
                    var quantity = interaction.message.components[2].components[0].customId.split('-')[4];
                    var shop = interaction.message.components[2].components[0].customId.split('-')[2];
                }

                await interaction.message.delete();

                selector.generateShopItemsSelector(interaction, shop, interaction.values[0], quantity);
                break;
            case 'shopAmountChoice':
                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to shop with your own character, please use the t.shop commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                if (interaction.message.components[2] == undefined) {
                    var item = interaction.message.components[1].components[0].customId.split('-')[3];
                    var shop = interaction.message.components[1].components[0].customId.split('-')[2];
                } else {
                    var item = interaction.message.components[2].components[0].customId.split('-')[3];
                    var shop = interaction.message.components[2].components[0].customId.split('-')[2];
                }

                interaction.message.delete();

                selector.generateShopItemsSelector(interaction, shop, item, interaction.values[0]);
                break;
            default:
                break;

            
        }   

        if(sliders.has(command)) {
            try {
                await sliders.get(command).interact(interaction, interaction.values, args);
            } catch (error) {
                console.error(error);
            }
        }
    }
}