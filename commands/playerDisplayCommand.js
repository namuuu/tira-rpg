const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
//const itemData = require('../data/items.json');

module.exports = {
    name: "display",
    aliases: [],
    description: "",
    requireCharacter: true,
    async execute(message, args) {
        const author = message.author;

        // Get data from MongoDB
        const playerInfo = await dbUtils.getPlayerData(author.id, "info");
        const playerStats = await dbUtils.getPlayerData(author.id, "stats");
        const playerInventory = await dbUtils.getPlayerData(author.id, "inventory");

        // Transform JSON Data
        const classData = rpgInfoUtils.getClassData(playerInfo.class);

        // Experience progress bar
        var expBar = "";
        var expToNextLevel = rpgInfoUtils.calculateExpToNextLevel(playerInfo.level);
        var expBarLength = Math.floor((playerInfo.exp / expToNextLevel) * 10);
        for(var i = 0; i < expBarLength; i++) {
            expBar += "▰";
        }
        for(var i = expBarLength; i < 10; i++) {
            expBar += "▱";
        }

        // Inventory display
        var inventoryDisplay = "";
        try {
            var inventoryLength = (playerInventory.items.length > 5) ? 5 : playerInventory.items.length;
            for(var i = 0; i < inventoryLength; i++) {
                inventoryDisplay += itemData[playerInventory.items[i]].name + " (x" + playerInventory.quantity[i] + ")";
                if(i < inventoryLength - 1) {
                    inventoryDisplay += ", ";
                }
            }
        } catch(err) {
            console.log(err);
        }
        if(inventoryDisplay == "") {
            inventoryDisplay = "Vide";
        }

        console.log(inventoryDisplay);

        const displayEmbed = new MessageEmbed()
            .setColor(author.accentColor)
            .setAuthor({name: 'Interface du joueur'})
            .addFields( 
                { name: 'Nom', value:  author.username },
                { name: 'Niveau ' + playerInfo.level, value: "Exp: " + playerInfo.exp + " / " + expToNextLevel + "\n" + expBar },
                { name: 'Classe', value:  classData.name + " " },
                { name: 'Force', value: playerStats.strength + " ", inline: true },
                { name: 'Vitalité', value: playerStats.vitality + " ", inline: true },
                { name: 'Résistance', value: playerStats.resistance + " ", inline: true },
                { name: 'Dextérité', value: playerStats.dexterity + " ", inline: true },
                { name: 'Agilité', value: playerStats.agility + " ", inline: true },
                { name: 'Intelligence', value: playerStats.intelligence + " ", inline: true },
                { name: 'Inventaire', value:  inventoryDisplay }
             )
             .setThumbnail(author.displayAvatarURL());
            
            message.channel.send({embeds: [displayEmbed]});
            return;
    }
}