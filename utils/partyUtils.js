const { EmbedBuilder } = require("@discordjs/builders")
const db = require("../utils/databaseUtils.js")

/**
 * Basic error message for the party command
 * @param {*} message message to respond to
 */
exports.sendError = function(message, reason) {
    const embed = new EmbedBuilder()
        .setTitle("That is not how that works !")
        .setDescription("Reason: " + reason)
        .setFooter({text: "To get more information about the party command, type `t.party help`"})
        .setColor(0xb22222)

    message.channel.send({ embeds: [embed] });
}

/**
 * send general help for the party command
 * @param {*} message message to respond to 
 */
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

/**
 * Displays the party of the player sent in parameter
 * @param {*} message message sent by the sender
 * @param {*} id player id
 * @returns 
 */
exports.displayParty = async function(message, id) {
    const playerData = await db.getPlayerData(id, "misc");

    if(!playerData) {
        this.sendError(message, "This player does not exist !");
        return;
    }

    if(playerData.party.members.length == 0) {
        this.sendError(message, "This player is not in a party !");
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

exports.invite = async function(message, id) {
    const author = message.author;

    const authorData = await db.getPlayerData(author.id, "misc");
    const targetData = await db.getPlayerData(id, "misc");

    if(!authorData || !targetData) {
        this.sendError(message, "You or the target's player does not exist !");
        return;
    }

    if(authorData.party.owner != author.id) {
        this.sendError(message, "You are not the owner of your party !");
        return;
    }

    if(targetData.party.members.length != 0) {
        this.sendError(message, "The target is already in a party !");
        return;
    }

    if(authorData.party.members.length >= 4) {
        this.sendError(message, "Your party is full !");
        return;
    }

    if(authorData.party.invitations.includes(id)) {
        this.sendError(message, "You already invited this player !");
        return;
    }

    authorData.party.invitations.push(id);
    
    
}