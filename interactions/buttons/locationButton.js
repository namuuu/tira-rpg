
module.exports = {
    name: "location",
    interact: async function(interaction, args) {
        switch(args[0]) {
            case "far_travel":
                if(args[1] != interaction.user.id) {
                    interaction.deferUpdate();
                    return;
                }
                interaction.reply({content: "Not implemented yet", ephemeral: true});
                break;
            default:
                break;
        };
    }
}