const { EmbedBuilder, ButtonBuilder, ButtonStyle, MessageActionRow, MessageSelectMenu, ActionRowBuilder } = require('discord.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');

// Player data management

exports.sendChooseClassSelector = async function(channel) {
    const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('chooseClass')
					.setPlaceholder('Aucune classe sélectionnée')
					.addOptions([
						{
							label: 'Guerrier',
							value: 'warrior',
						},
						{
							label: 'Rôdeur',
							value: 'assassin',
						},
                        {
							label: 'Magicien',
							value: 'magician',
						},
                        {
							label: 'Tireur',
							value: 'ranger',
						},
                        {
							label: 'Soigneur',
							value: 'healer',
						},
					]),
			);

	await channel.send({ content: 'debug: Choisis ta classe!', components: [row] });
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