const { ActionRowBuilder, StringSelectMenuBuilder } = require("@discordjs/builders");
const locationJSON = require("../../data/location.json");

module.exports = {
    name: "location",
    interact: async function(interaction, args) {
        switch(args[0]) {
            case "far_travel":
                if(args[1] != interaction.user.id) {
                    interaction.deferUpdate();
                    return;
                }
                const locationData = Object.values(locationJSON);
                const locationOptions = [];
                for(const location of locationData) {
                    locationOptions.push({
                        label: location.name,
                        value: location.id,
                        description: location.short_description
                    })
                }

                const slider = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("location-change_location-" + interaction.user.id)
                            .setPlaceholder("Select a location here!")
                            .addOptions(locationOptions),
                    );
                interaction.message.edit({components: [slider]});
                break;
            default:
                break;
        };
    }
}