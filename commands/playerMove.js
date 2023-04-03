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
        const playerStory = await player.getData(message.author.id, "story");
        const playerInventory = await player.getData(message.author.id, "inventory");

        const location = locationJSON[playerStory.locations.current_location]; // Data of the location the player is in
        const playerZone = zonesData[playerStory.locations.current_zone]; // Data of the zone the player is in

        if(location == undefined)
            return;

        for(const zone of location.zones) {
            const zoneData = zonesData[zone]; // Data of the specific zone

            if(playerStory.locations.current_zone == zone) {
                continue;
            }

            if(zoneData.required.level != undefined) {
                if(playerInfo.level < zoneData.required.level) {
                    console.log("Level too low: " + zoneData.required.level);
                    continue;
                }
            }

            if(zoneData.required.items != undefined) {
                for(const item of zoneData.required.items) {
                    if(!Object.entries(playerInventory.items).includes(item)) {
                        console.log("Item not found: " + item);
                        continue;
                    }
                }
            }

            availableLocations.push({
                label: zoneData.name,
                value: zone,
                description: zoneData.description
            });
        }

        const embed = new EmbedBuilder()
            .setDescription('You are currently in:')
            .addFields(
                { name: playerZone.name, value: 'Where would you want to go?'},
            )
            .setFooter({text: 'Need to learn more about where you are? Use the command: t.location'})

        if(playerZone.color != undefined)
            embed.setColor(playerZone.color);

        const slider = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('location-travel-' + message.author.id)
                    .setPlaceholder('Select a place to go to!')
                        .addOptions(availableLocations),
            );
        
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('location-far_travel-' + message.author.id)
                    .setLabel('Go somewhere else')
                    .setStyle(ButtonStyle.Secondary)
            );
    
        if(playerStory.locations.unlocked_locations.length <= 1) {
            await message.reply({embeds: [embed], components: [slider] });
            message.delete();
        } else {
            await message.reply({embeds: [embed], components: [slider, button] });
            message.delete();
        }
    }
}