const { ActionRowBuilder, StringSelectMenuBuilder } = require("@discordjs/builders");
const player = require("../../utils/playerUtils.js");
const regionsData = require("../../data/regions.json");

module.exports = {
    name: "location",
    interact: async function(interaction, args) {
        switch(args[0]) {
            case "far_travel":
                if(args[1] != interaction.user.id) {
                    interaction.deferUpdate();
                    return;
                }

                const locationInfo = (await player.getData(interaction.user.id, "story")).location;
                console.log(locationInfo);
                const availableLocations = locationInfo.unlocked_regions;

                const locationOptions = [];
                for(const region of Object.values(regionsData)) {
                    if(availableLocations.includes(region.id) && region.id != locationInfo.region)
                        locationOptions.push({
                            label: region.name,
                            value: region.id,
                            description: region.short_description
                        })
                }

                if(locationOptions.length == 0) {
                    interaction.deferUpdate();
                    return;
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