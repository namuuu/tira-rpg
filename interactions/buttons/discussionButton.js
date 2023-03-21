const discussion = require('../../utils/discussionUtils.js');

module.exports = {
    name: "discussion",
    interact: async function(interaction, args) {
        if(args[2] != interaction.user.id) {
            interaction.reply({ content: "The discussion wasn't directed towards you!", ephemeral: true });
            return;
        }


        interaction.deferUpdate();

        if(args[0] == undefined)
            return;

        interaction.message.delete();
        discussion.send(interaction.user, interaction.channel, args[0], args[1]);
    }
}