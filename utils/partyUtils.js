const { EmbedBuilder } = require("@discordjs/builders")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const player = require("../utils/playerUtils.js")

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
    const playerData = await player.getData(id, "misc");

    if(!playerData) {
        this.sendError(message, "This player does not exist !");
        return;
    }

    if(playerData.party.members.length == 0) {
        this.sendError(message, "This player is not in a party !");
        return;
    }

    const partyOwnerData = await player.getData(playerData.party.owner, "misc");

    const embed = new EmbedBuilder()
        .setTitle("Party of " + message.author.username)
        .setDescription("Owner: <@" + partyOwnerData.party.owner + ">")
        .setColor(0x00bfff)
        .addFields(
            { name: "Members", value: partyOwnerData.party.members.map(member => "<@" + member + ">").join("\n") }
        )

    message.channel.send({ embeds: [embed] });
}

exports.invite = async function(message, id) {
    const author = message.author;

    if(id == author.id) {
        this.sendError(message, "You cannot invite yourself !");
        return;
    }

    const authorData = await player.getData(author.id, "misc");
    const targetData = await player.getData(id, "misc");

    if(!authorData || !targetData) {
        this.sendError(message, "The target's player does not exist !");
        return;
    }

    if(authorData.party.owner != author.id && authorData.party.owner != null) {
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

    const embed = new EmbedBuilder()
        .setTitle("Party invitation")
        .setDescription("You have been invited to join " + author.username + "'s party !")
        .setColor(0x00bfff)

    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Join party !") 
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("party_accept-" + author.id + "-" + id)
        );

    message.guild.members.cache.get(id).send({ embeds: [embed], components: [button] });
}

exports.acceptInvitation = async function(accepteeId, senderId, interaction) {
    const accepteeData = await player.getData(accepteeId, "misc");
    const senderData = await player.getData(senderId, "misc");

    if(!accepteeData || !senderData) {
        interaction.reply("You or the sender's player does not exist !");
        return;
    }

    //console.log(accepteeData.party.owner);
    //console.log(accepteeId);
    if(senderData.party.members.length >= 4) {
        interaction.reply("Their party is full!");
        return;
    }
    if(accepteeData.party.members.length != 0) {
        interaction.reply("You are already in a party !");
        return;
    }
    if(accepteeData.party.owner == senderId) {
        interaction.reply("You are already in this party !");
        return;
    }
    if(accepteeData.party.owner != accepteeId && accepteeData.party.owner != null) {
        interaction.reply("You already have a party !");
        return;
    }

    senderData.party.members.push(accepteeId);
    accepteeData.party.members.push(accepteeId);
    accepteeData.party.members.push(senderData.party.members);
    accepteeData.party.owner = senderId;

    await player.updateData(accepteeId, accepteeData, "misc");
    await player.updateData(senderId, senderData, "misc");

    const embed = new EmbedBuilder()
        .setTitle("Party invitation accepted")
        .setDescription("You have joined <@" + senderId + ">'s party !")
        .setColor(0x00bfff)

    interaction.reply({ embeds: [embed] });
}

exports.kick = async function(message, targetId) {
    const author = message.author;

    if(targetId == author.id) {
        this.sendError(message, "You cannot kick yourself !");
        return;
    }

    const authorData = await player.getData(author.id, "misc");
    const targetData = await player.getData(targetId, "misc");

    if(!authorData || !targetData) {
        this.sendError(message, "The target's player does not exist !");
        return;
    }

    if(authorData.party.owner != author.id && authorData.party.owner != null) {
        this.sendError(message, "You are not the owner of your party !");
        return;
    }

    if(targetData.party.owner != author.id) {
        this.sendError(message, "The target is not in your party !");
        return;
    }

    authorData.party.members = authorData.party.members.filter(member => member != targetId);
    targetData.party.owner = targetId;
    targetData.party.members = [];

    await player.updateData(targetId, targetData, "misc");
    await player.updateData(author.id, authorData, "misc");

    const embed = new EmbedBuilder()
        .setTitle("Party kick")
        .setDescription("<@" + targetId + "> have been kicked from <@" + author.id + ">'s party !")
        .setColor(0x00bfff)

    message.reply({ embeds: [embed] });
}

exports.disband = async function(message) {
    const author = message.author;

    const authorData = await player.getData(author.id, "misc");

    if(!authorData) {
        this.sendError(message, "You don't have a player !");
        return;
    }

    if(authorData.party.owner != author.id) {
        this.sendError(message, "You are not the owner of your party !");
        return;
    }

    if(authorData.party.members.length == 0) {
        this.sendError(message, "You are not in a party !");
        return;
    }

    const members = authorData.party.members;

    for(let i = 0; i < members.length; i++) {
        const memberData = await player.getData(members[i], "misc");

        memberData.party.owner = members[i];
        memberData.party.members = [];

        await player.updateData(members[i], memberData, "misc");
    }

    authorData.party.owner = null;
    authorData.party.members = [];

    await player.updateData(author.id, authorData, "misc");

    const embed = new EmbedBuilder()
        .setTitle("Party disband")
        .setDescription("Your party has been disbanded !")
        .setColor(0x00bfff)

    message.reply({ embeds: [embed] });
}

exports.quit = async function(message) {
    const author = message.author;

    const authorData = await player.getData(author.id, "misc");

    if(!authorData) {
        this.sendError(message, "You don't have a player !");
        return;
    }

    if(authorData.party.owner == null || authorData.party.members.length == 0) {
        this.sendError(message, "You are not in a party !");
        return;
    }

    if(authorData.party.owner == author.id) {
        this.sendError(message, "You are the owner of the party, use `t.party disband` instead !");
        return;
    }

    const ownerData = await player.getData(authorData.party.owner, "misc");

    ownerData.party.members = ownerData.party.members.filter(id => id != author.id);
    authorData.party.owner = author.id;
    authorData.party.members = authorData.party.members.filter(id => id != author.id);

    await player.updateData(author.id, authorData, "misc");

    const embed = new EmbedBuilder()
        .setTitle("Party")
        .setDescription("You have left the party !")
        .setColor(0x00bfff)

    message.channel.send({ embeds: [embed] });
}

exports.disband = async function(message) { 
    const author = message.author;

    const authorData = await player.getData(author.id, "misc");

    if(!authorData) {
        this.sendError(message, "You don't have a player !");
        return;
    }

    if(authorData.party.owner == null || authorData.party.members.length == 0) {
        this.sendError(message, "You are not in a party !");
        return;
    }

    if(authorData.party.owner != author.id) {
        this.sendError(message, "You are not the owner of the party !");
        return;
    }

    authorData.party.owner = author.id;
    authorData.party.members = [];

    for(const member of authorData.party.members) {
        const memberData = await player.getData(member, "misc");

        memberData.party.owner = member;
        memberData.party.members = [];

        await player.updateData(member, memberData, "misc");
    }

    await player.updateData(author.id, authorData, "misc");

    const embed = new EmbedBuilder()
        .setTitle("Party")
        .setDescription("You have disbanded your party !")
        .setColor(0x00bfff)

    message.channel.send({ embeds: [embed] });
}