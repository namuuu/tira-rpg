const player = require('../utils/playerUtils.js');
const skill = require('../utils/abilityUtils.js');
const equip = require('../utils/equipUtils.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        if(interaction.message.author.id != client.user.id) return;
        if (!interaction.isModalSubmit()) return;
	    
        const { user, customId } = interaction;
        const userId = user.id;

        const args = customId.split('-');
        const command = args.shift();

        if(!(await player.doesExists(user.id))) return;

        switch(command) {
            case 'selectAbility':
                skill.receiveModal(interaction, true);
                break;
            case 'unselectAbility':
                skill.receiveModal(interaction, false);
                break;
            case 'equip':
                equip.receiveModal(interaction, userId, interaction.fields.getTextInputValue('text-input'), args[0], true);
                break;
            case 'unequip':
                equip.receiveModal(interaction, userId, interaction.fields.getTextInputValue('text-input'), args[0], false);
                break;
            default:
                break;
        }
    }
}