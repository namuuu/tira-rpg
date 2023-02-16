const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const player = require('../utils/playerUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const skillsData = require('../data/skills.json');
const { getInventoryString } = require('../utils/inventoryUtils.js');
const { getStringActiveSkill } = require('../utils/skillUtils.js');

module.exports = {
    name: "display",
    aliases: [],
    description: "",
    requireCharacter: true,

    async execute(message, args) {
        const author = message.author;

        // Get data from MongoDB
        const playerInfo = await player.getData(author.id, "info");
        const playerStats = await player.getData(author.id, "stats");
        const playerInventory = await player.getData(author.id, "inventory");

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

        // Health percentage
        var percHealth = Math.round((playerInfo.health / playerStats.vitality)*100);

        // Inventory display
        var inventoryDisplay = getInventoryString(playerInventory.items);

        // Skills display
        var skillsDisplay = getStringActiveSkill(playerInventory.activeSkills);

        //console.log(skillsDisplay);

        /*
        Il manque à ajouter les valeurs réelles des HP, argent, equipement,skills et inventaire
        Affichage clarifié de l'equipement,skills et inventaire
        */
        const displayEmbed = new EmbedBuilder()
            .setTitle('Inventory')
            .setColor(0x0099FF)
            .setAuthor({name: author.username,iconURL: 'https://media.discordapp.net/attachments/1021799485069873152/1039900731345485844/DALLE_2022-11-09_14.53.50_-_middle_ages_storyteller_digital_art.png?width=890&height=890'})
            .addFields( 
                { name: 'HP', value: `${playerInfo.health}/${playerStats.vitality} (${percHealth}%)`, inline: true },
                { name: 'Argent', value:  "100 💵" , inline: true},
                { name: 'Niveau ' + playerInfo.level, value: "Exp: " + playerInfo.exp + " / " + expToNextLevel + "\n" + expBar },
                { name: 'Classe', value:  classData.name + " " },
                { name: 'Force', value: playerStats.strength + " ", inline: true },
                { name: 'Vitalité', value: playerStats.vitality + " ", inline: true },
                { name: 'Résistance', value: playerStats.resistance + " ", inline: true },
                { name: 'Dextérité', value: playerStats.dexterity + " ", inline: true },
                { name: 'Agilité', value: playerStats.agility + " ", inline: true },
                { name: 'Intelligence', value: playerStats.intelligence + " ", inline: true },
                { name: 'Equipement', value:  " " },
                { name: 'Skills actifs', value:  skillsDisplay },
                { name: 'Inventaire', value:  inventoryDisplay }
             )
            .setThumbnail('https://fortnite-api.com/images/cosmetics/br/bid_161_snowboardfemale/icon.png');

            const row = new ActionRowBuilder()
			    .addComponents(
				    new ButtonBuilder()
                        .setCustomId('displayInventory')
                        .setLabel('Display your inventory')
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId('displaySkills')
                        .setLabel('Display your skills')
                        .setStyle(ButtonStyle.Secondary),
                        
                    new ButtonBuilder()
                        .setCustomId('displayEquips')
                        .setLabel('Display your equipement')
                        .setStyle(ButtonStyle.Secondary),
			);


            message.channel.send({embeds: [displayEmbed], components: [row]});
            return;
    }
}