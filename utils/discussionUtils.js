const { EmbedBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const discussionData = require('../data/discussion.json');
const playerUtil = require('../utils/playerUtils.js');
const inventoryUtil = require('../utils/inventoryUtils.js');

exports.getData = function(category, id) {
    const cat = discussionData[category];
    return cat.filter(item => item.id === id)[0];
}

exports.send = function(user, channel, category, id) {
    const data = exports.getData(category, id);

    if(data === undefined) return;

    const embed = getEmbed(data);

    if(embed === null) return;

    if(data.type === undefined) {
        channel.send({ embeds: [embed] });
        return;
    }

    const row = new ActionRowBuilder();

    switch(data.type.name) {
        case "follow-up":
            row.addComponents(getNextButton(category, id, user.id));
            channel.send({ embeds: [embed], components: [row] });
            break;
        case "end-discussion":
            channel.send({ embeds: [embed] });
            break;
        case "multiple-choice":
            data.type.choices.forEach(choice => {
                row.addComponents(makeButton(choice.text, category, choice.id, user.id));
            });
            channel.send({ embeds: [embed], components: [row] });
            break;
    }

    if(data.rewards !== undefined) {
        giveRewards(user, data.rewards);
    }
}

function getEmbed(data) {

    if(data.embed === undefined) return null;

    const embed = new EmbedBuilder();

    if(data.embed.title !== undefined) embed.setTitle(data.embed.title);
    if(data.embed.description !== undefined) embed.setDescription(data.embed.description);
    if(data.embed.footer !== undefined) embed.setFooter(data.embed.footer);
    if(data.embed.color !== undefined) embed.setColor(data.embed.color);

    if(data.embed.fields !== undefined) {
        data.embed.fields.forEach(field => {
            embed.addFields({name: field.name, value: field.value});
        });
    }

    return embed;
}

function getNextButton(category, id, userId) {
    const data = discussionData[category];

    const current = data.filter(item => item.id === id)[0];

    if(current.type === undefined) return makeButton("Error!", "error", "error");

    if(current.type.name !== "follow-up") return makeButton("Error!", "error", "error");

    var next;

    if(current.type.next === undefined) {
        if(data.indexOf(current) + 1 >= data.length) return makeButton("Error!", "error", "error");

        next = data[data.indexOf(current) + 1];
        console.log(next);
    } else {
        next = data.filter(item => item.id === current.type.next)[0];
    }

    return makeButton("Next", category, next.id);
}

function makeButton(name, category, id, userId) {
    return new ButtonBuilder()
        .setCustomId("discussion-" + category + "-" + id + "-" + userId)
        .setLabel(name)
        .setStyle(ButtonStyle.Secondary);
}

function giveRewards(user, rewards) {
    rewards.forEach(reward => {
        switch(reward.type) {
            case "xp":
                playerUtil.exp.award(user.id, reward.amount);
                break;
            case "item":
                inventoryUtil.giveItem(user.id, reward.id, reward.amount);
                break;
        }
    });
}