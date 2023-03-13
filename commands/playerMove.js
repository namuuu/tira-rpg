const { Client, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const player = require("../utils/playerUtils.js");
const locationJSON = require('../data/location.json');
const zonesData = require('../data/zones.json');

module.exports = {
    name: "move",
    description: "",
    requireCharacter: true,
    async execute(message, args) {
        var availableLocations = []; // Array of locations that the player can go to
    
        for(const location of Object.values(locationJSON)) {
            for(const zone of location.zones) {
                const zoneData = zonesData[zone]; // Data of the specific zone
                const playerInfo = await player.getData(message.author.id, "info");
                const playerInventory = await player.getData(message.author.id, "inventory");

                if(playerInfo.location == zone) {
                    continue;
                }

                console.log(zoneData);

                if(zoneData.required.level != null) {
                    if(playerInfo.level < zone.required.level) {
                        continue;
                    }
                }

                if(zoneData.required.items != null) {
                    for(const item of zone.required.items) {
                        if(!playerInventory.items.includes(item)) {
                            continue;
                        }
                    }
                }

                availableLocations.push({
                    label: zone,
                    value: zone,
                    description: location.name
                })
            }
        }


        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('locationChoice-' + message.author.id)
                    .setPlaceholder('Nothing selected')
                        .addOptions(availableLocations),
            );
    
        return message.reply({content: 'Choose the location where you want to go !', components: [row] });
    }
}