const player = require('../utils/playerUtils.js');
const { receiveModal } = require('../utils/skillUtils.js');

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
            case 'select_skill':
                receiveModal(interaction, true);
                break;
            case 'unselect_skill':
                receiveModal(interaction, false);
                break;
            default:
                break;
        }
    }
}