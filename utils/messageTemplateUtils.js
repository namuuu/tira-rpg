const { Client } = require('discord.js');
const { ActionRowBuilder, Events, StringSelectMenuBuilder } = require('discord.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const databaseUtils = require('../utils/databaseUtils.js');
const messageCreate = require('../events/messageCreate.js');

// Player data management

exports.generateSelector = async function(message) {
		const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('select')
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
					),
			);

		return message.reply({content: 'Choose a class ! Poyo', components: [row] });
	}


