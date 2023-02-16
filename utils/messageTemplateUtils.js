const { Client } = require('discord.js');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, MessageActionRow, MessageSelectMenu, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const databaseUtils = require('../utils/databaseUtils.js');
const messageCreate = require('../events/messageCreate.js');

// Player data management

exports.generateSelector = async function(message) {
	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('classChoice-' + message.author.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					{
						label: 'Warrior',
						value: 'warrior',
					},
					{
						label: 'Assassin',
						value: 'assassin',
					},
					{
						label: 'Mage',
						value: 'magician',
					},
					{
						label: 'Ranger',
						value: 'ranger',
					},
					{
						label: 'Healer',
						value: 'healer',
					},
				),
		);

	return message.reply({content: 'Choose a class to start your adventure !', components: [row] });
}


exports.sendEncounterMessage = async function(message, type) {
	const mainEmbed = new EmbedBuilder()
		.setTitle('The roar of battle is heard in the distance...')
		.setTimestamp()

	switch(type) {
		case 'wild-encounter':
			mainEmbed.addFields({name: 'Players', value: 'Waiting for players...'});
			break;
		default:
			mainEmbed.addFields({name: 'Wrong type', value: 'Something seems to be wrong with our sysem.', inline: true});
			break;
	}

	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('joinFight-' + message.id + '-1')
				.setLabel('Join in !')
				.setStyle(ButtonStyle.Secondary)
				
		);

	return message.edit({content:'', embeds: [mainEmbed], components: [row] });
}

exports.generateLocationSelector = async function(message) {
	list = [];
	for(var i = 0; i < Object.keys(locationData).length; i++) {
		for (var j = 0; j < locationData[Object.keys(locationData)[i]].zones.length; j++) {
			value = locationData[Object.keys(locationData)[i]].zones[j].toString();
			console.log(value);
			list.push({
				label: locationData[Object.keys(locationData)[i]].name + ' - ' + zonesData[locationData[Object.keys(locationData)[i]].zones[j]].name.toString(),
				value: locationData[Object.keys(locationData)[i]].zones[j].toString(),
			});
		}
	}
	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('locationChoice-' + message.author.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					list
				),
		);

	return message.reply({content: 'Choose the location where you want to go !', components: [row] });
}