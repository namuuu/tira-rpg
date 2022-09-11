const { MessageActionRow, MessageSelectMenu } = require('discord.js');
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
