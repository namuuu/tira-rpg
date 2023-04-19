const player = require("../utils/playerUtils.js");
const regionsData = require("../data/regions.json");
const zoneData = require("../data/zones.json");
const { EmbedBuilder } = require("@discordjs/builders");

module.exports = {
    name: "location",
    aliases: [],
    description: "Get information about where you are.",
    requireCharacter: true,
    async execute(message, args) {
        const locationInfo = (await player.getData(message.author.id, "story")).location;
        const zone = zoneData[locationInfo.zone];

        const embed = new EmbedBuilder()
            .setTitle(zone.name)
            .setDescription(zone.description)
            .addFields(
                { name: "Situated in:", value: regionsData[locationInfo.region].name, inline: true },
                { name: "Monster Presence", value: (Object.values(zone.monsters).length > 0) ? "Yes" : "No", inline: true },
            )

        if(zone.color !== undefined) 
            embed.setColor(zone.color);

        message.channel.send({ embeds: [embed] });
    }
}