const { Client } = require('discord.js');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, MessageActionRow, MessageSelectMenu, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const player = require('../utils/playerUtils.js');
const messageCreate = require('../events/messageCreate.js');
const locationData = require('../data/location.json');
const zonesData = require('../data/zones.json');
const shopsData = require('../data/shops.json');

// Player data management

exports.generateSelector = async function(message) {
	list = [];
	for(var i = 0; i < Object.keys(classData).length; i++) {
		list.push({
			label: classData[Object.keys(classData)[i]].name.toString(),
			value: Object.keys(classData)[i].toString(),
		});
	}
	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('classChoice-' + message.author.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					list
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
	const playerCollection = Client.mongoDB.db('player-data').collection(message.author.id);

	for(var i = 0; i < Object.keys(locationData).length; i++) {
		for (var j = 0; j < locationData[Object.keys(locationData)[i]].zones.length; j++) {

			const currentLocation = await player.getData(message.author.id, "info");
			if (currentLocation.location == locationData[Object.keys(locationData)[i]].zones[j]) {	
				continue;
			}

			//level verification 
			if (zonesData[locationData[Object.keys(locationData)[i]].zones[j]].required.level != "") {
				const info = await player.getData(message.author.id, "info");
				const level = info.level;
				if (level < zonesData[locationData[Object.keys(locationData)[i]].zones[j]].required.level) {
					continue;
				}
			}

			//items verification
			if(zonesData[locationData[Object.keys(locationData)[i]].zones[j]].required.items != "") {
				const inventory = await player.getData(message.author.id, "inventory");
				const ZoneItems = zonesData[locationData[Object.keys(locationData)[i]].zones[j]].required.items;
				var hasItems = false;
				for (var k = 0; k < ZoneItems.length; k++) {
					hasItems = false;
					for (var l = 0; l < inventory.items.length; l++) {
						if (inventory.items[l] == ZoneItems[k]) {
							hasItems = true;
						}
					}
					if (!hasItems) {
						break;
					}
				}
				if (!hasItems) {
					continue;
				}
			}

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

exports.generateShopSelector = async function(message) {
	list = [];
	const currentLocation = await player.getData(message.author.id, "info");
	for(var i = 0; i < Object.keys(shopsData).length; i++) {

		//zone verification
		var isOkay = false;
		for (var j = 0; j < zonesData[currentLocation.location].shops.length; j++) {
			if (zonesData[currentLocation.location].shops[i] == Object.keys(shopsData)[i]) {
				isOkay = true;
			}
		}

		if (!isOkay)
			continue;


		list.push({
			label: shopsData[Object.keys(shopsData)[i]].name.toString(),
			value: Object.keys(shopsData)[i].toString(),
		});
	}

	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('shopChoice-' + message.author.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					list
				),
		);

	return message.reply({content: 'Choose the shop you want to visit !', components: [row] });
}

exports.generateShopItemsSelector = async function(message, shop) {
	list = [];
	for(var i = 0; i < shopsData[shop].items.length; i++) {
		list.push({
			label: shopsData[shop].items[i].name.toString() + ' - ' + shopsData[shop].items[i].cost.toString() + ' coins',
			value: shopsData[shop].items[i].id.toString(),
		});
	}

	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('shopItemChoice-' + message.author.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					list
				),
		);

	return message.reply({content: 'Choose the item you want to buy !', components: [row] });
}