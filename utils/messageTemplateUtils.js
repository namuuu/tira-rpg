const { Client } = require('discord.js');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, MessageActionRow, MessageSelectMenu, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const player = require('../utils/playerUtils.js');
const zonesData = require('../data/zones.json');
const shopsData = require('../data/shops.json');
const classData = require('../data/classes.json');

// Player data management

exports.sendErrorEmbed = async function(message, error) {
	const errorEmbed = new EmbedBuilder()
		.setColor('F08080')
		.setAuthor({name: 'An error occured'})
		.addFields( { name: 'An error occured while executing your command.', value: error } );
	
	return message.channel.send({embeds: [errorEmbed]});
}

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
	

	return message.reply({embeds: [embed], components: [row] });
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
			mainEmbed.addFields({name: 'Wrong type', value: 'Something seems to be wrong with our system.', inline: true});
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

exports.generateShopSelector = async function(message) {
	list = [];
	const currentLocation = await player.getData(message.author.id, "story");
	for(var i = 0; i < Object.keys(shopsData).length; i++) {

		//zone verification
		var isOkay = false;
		
		for (var j = 0; j < zonesData[currentLocation.location.zone].shops.length; j++) {
			if (zonesData[currentLocation.location.zone].shops[j] == Object.keys(shopsData)[i]) {
				isOkay = true;
			}
		}

		if (!isOkay) {
			continue;
		}
			
		console.log('ok');

		list.push({
			label: shopsData[Object.keys(shopsData)[i]].name.toString(),
			value: Object.keys(shopsData)[i].toString(),
		});
	}

	var row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('shopChoice-' + message.author.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					list
				),
		);

	console.log(list.length);

	if(list.length == 0) {
		var row = new EmbedBuilder() 
			.setColor(0x1be118)
			.setTitle('No shop available')	
			.setDescription('There is no shop available in this zone !');

		return message.reply({content: 'Choose the shop you want to visit !', embeds: [row] });
	}
				

	return message.reply({content: 'Choose the shop you want to visit !', components: [row] });
}

exports.generateShopItemsSelector = async function(message, shop, item, quantity) {
	list = [];
	for(var i = 0; i < Object.keys(shopsData[shop].items).length; i++) {
		list.push({
			label: shopsData[shop].items[Object.keys(shopsData[shop].items)[i]].name.toString() + ' - ' + shopsData[shop].items[Object.keys(shopsData[shop].items)[i]].cost.toString() + ' coins',
			value: shopsData[shop].items[Object.keys(shopsData[shop].items)[i]].id.toString(),
		});
	}

	var ShopEmbed = new EmbedBuilder()
                .setColor(0x1be118)
                .setTitle(shopsData[shop].name)

	if(item != "0") {
		var currentItem = shopsData[shop].items[item].name;

		var ShopEmbed = new EmbedBuilder()
				.setColor(0x1be118)
				.setTitle(shopsData[shop].name)
				.setDescription('You selected ' + currentItem + ' !');
	}

	if(quantity != "0") {
		var currentQuantity = quantity;

		var ShopEmbed = new EmbedBuilder()
				.setColor(0x1be118)
				.setTitle(shopsData[shop].name)
				.setDescription('You selected to buy ' + currentQuantity + ' items !');
	}

	if(item != "0" && quantity != "0") {
		var currentItem = shopsData[shop].items[item].name;
		var currentQuantity = quantity;

		var ShopEmbed = new EmbedBuilder()
				.setColor(0x1be118)
				.setTitle(shopsData[shop].name)
				.setDescription('You selected ' + currentQuantity + ' ' + currentItem + ' !');
	}
	
	const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('shopItemChoice-' + message.user.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					list
				),
		);

	const row2 = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('shopAmountChoice-' + message.user.id)
				.setPlaceholder('Nothing selected')
					.addOptions(
					[
						{
							label: '1',
							value: '1',
						},
						{
							label: '2',
							value: '2',
						},
						{
							label: '3',
							value: '3',
						},
						{
							label: '4',
							value: '4',
						},
						{
							label: '5',
							value: '5',
						},
						{
							label: '6',
							value: '6',
						},
						{
							label: '7',
							value: '7',
						},
						{
							label: '8',
							value: '8',
						},
						{
							label: '9',
							value: '9',
						},
						{
							label: '10',
							value: '10',
						},
					]
				),
		);

		const button = new ButtonBuilder()
		.setCustomId('buyItem-' + message.user.id + '-' + shop + '-' + item + '-' + quantity)
		.setLabel('Buy')
		.setStyle(ButtonStyle.Success);

		const buyButton = new ActionRowBuilder()
		.addComponents(
			button
		);

	if(item == "0" && quantity == "0") {
	message.reply({content: 'Choose the item you want to buy !', embeds:[ShopEmbed], components: [row, row2, buyButton] });
	} else if(item != "0" && quantity == "0") {
	message.reply({content: 'Choose the item you want to buy !', embeds:[ShopEmbed], components: [row2, buyButton] });
	} else if(item == "0" && quantity != "0") {
	message.reply({content: 'Choose the item you want to buy !', embeds:[ShopEmbed], components: [row, buyButton] });
	} else if(item != "0" && quantity != "0") {
	message.reply({content: 'Choose the item you want to buy !', embeds:[ShopEmbed], components: [buyButton] });
	}
	return; 
}