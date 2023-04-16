const { ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const equip = require('../../utils/equipUtils.js');
const equipData = require('../../setup/equipSetup.js');


module.exports = {
    name: "equip",
    interact: async function(interaction, values, args) {
        switch(args[0]) {
            case "display":
                interaction.message.edit({ embeds: [equip.getEquipData(values[0])], components: [] });
        }
    }
}