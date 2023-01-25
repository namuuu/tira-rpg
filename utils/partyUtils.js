const { EmbedBuilder } = require("@discordjs/builders")
const db = require("../utils/databaseUtils.js")

exports.sendError = function(message) {
    const embed = new EmbedBuilder()
        .setTitle("That is not how that works !")
        .setDescription("To get more information about the party command, type `t.party help`")
        .setColor(0xb22222)

    message.channel.send({ embeds: [embed] });
}

exports.sendHelp = function(message) {

    const embed = new EmbedBuilder()
        .setTitle("Party Help")
        .setDescription("Create a party with your friends, and defeat foes together!")
        .addFields(
            { name: "Display your own party", value: "`t.party display`" },
            { name: "Display someone else's party", value: "`t.party display <@user>`\n" },
            { name: "Invite someone to your party", value: "`t.party invite <@user>`" },
            { name: "Accept an invitation to someone's party and join it", value: "`t.party join <@user>`\n" },
            { name: "Kick someone from your party", value: "`t.party kick <@user>`" },
            { name: "Disband your party", value: "`t.party disband`" },
        )
        .setColor(0xff8c00)

    message.channel.send({ embeds: [embed] });
}

exports.displayParty = async function(message, id) {
    const playerData = await db.getPlayerData(id, "misc");

    if(!playerData) {
        const embed = new EmbedBuilder()
            .setTitle("This player does not exist !")
            .setColor(0xb22222)

        message.channel.send({ embeds: [embed] });
        return;
    }

    if(playerData.party.members.length == 0) {
        const embed = new EmbedBuilder()
            .setTitle("This player is not in a party !")
            .setColor(0xb22222)

        message.channel.send({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle("Party of " + message.author.username)
        .setDescription("Owner: " + message.guild.members.cache.get(playerData.party.owner).user.username)
        .setColor(0x00bfff)
        .addFields(
            { name: "Members", value: playerData.party.members.map(member => message.guild.members.cache.get(member).user.username).join("\n") }
        )

    message.channel.send({ embeds: [embed] });
}