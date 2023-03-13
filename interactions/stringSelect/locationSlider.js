const { EmbedBuilder } = require('@discordjs/builders');
const player = require('../../utils/playerUtils.js');
const zonesData = require('../../data/zones.json');

module.exports = {
    name: "location",
    interact: async function(interaction, values, args) {
        switch(args[0]) {
            case 'travel':
                if(args[1] != interaction.user.id) {
                    interaction.deferUpdate();
                    return;
                }

                interaction.message.delete();
                player.setLocation(interaction.user.id, values[0]);

                const embed = new EmbedBuilder()
                    .setDescription("🪶  **" + interaction.user.username + "** travelled to **" + zonesData[values[0]].name + "**")

                interaction.channel.send({embeds: [embed]})
                break;
            default:
                break;

        };
    }
}