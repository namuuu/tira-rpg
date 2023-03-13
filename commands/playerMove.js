const { Client, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const player = require("../utils/playerUtils.js");
const locationJSON = require('../data/location.json');
const zonesData = require('../data/zones.json');

module.exports = {
    name: "move",
    description: "",
    requireCharacter: true,
    async execute(message, args) {
        var availableLocations = []; // Array of locations that the player can go to
        const playerInfo = await player.getData(message.author.id, "info");
        const playerInventory = await player.getData(message.author.id, "inventory");
        const playerZone = zonesData[playerInfo.location];
    
        for(const location of Object.values(locationJSON)) {
            for(const zone of location.zones) {
                const zoneData = zonesData[zone]; // Data of the specific zone

                if(playerInfo.location == zone) {
                    continue;
                }

                if(zoneData.required.level != null) {
                    if(playerInfo.level < zone.required.level) {
                        continue;
                    }
                }

                if(zoneData.required.items != null) {
                    for(const item of zoneData.required.items) {
                        if(!playerInventory.items.includes(item)) {
                            continue;
                        }
                    }
                }

                availableLocations.push({
                    label: zoneData.name,
                    value: zone,
                    description: zoneData.description
                })
            }
        }

        const embed = new EmbedBuilder()
            .setDescription('You are currently in:')
            .addFields(
                { name: playerZone.name, value: 'Where would you want to go?'},
            )
            .setFooter({text: 'Need to learn more about where you are? Use the command: t.location'})

        const slider = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('location-travel-' + message.author.id)
                    .setPlaceholder('Select a place here!')
                        .addOptions(availableLocations),
            );

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('location-far_travel-' + message.author.id)
                    .setLabel('Go somewhere else')
                    .setStyle(ButtonStyle.Secondary)
            );
    
        message.reply({embeds: [embed], components: [slider, button] });
        message.delete();
    }
}