const { prefix } = require('./../config.json');
const { MessageEmbed, Embed, EmbedBuilder } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
    name: 'messageCreate',
    trigger(message, client) {
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;

        // args is an array that contains all the words after the command
        const args = message.content.slice(prefix.length).split(/ +/);
        // command is now the first argument (the command, yea)
        const command = args.shift().toLowerCase();

        if(!command) return;

        // If the command is not in the collection, return
        if (!client.commands.has(command) || message.author.bot) {

            const unknownEmbed = new EmbedBuilder()
            .setColor('F08080')
            .setAuthor({name: 'I don\'t know that command !'})
            .addFields( { name: 'You may have mistyped the command, or you may have used a command that is not yet implemented.', value: 'If you are unsure, please use the `help` command.' } );
            
            message.channel.send({embeds: [unknownEmbed]});
            return;
        };
        
        // Executing the command
        try {
            // Check if the command requires a character to exist in the database
            if(client.commands.get(command).requireCharacter) {
                dbUtils.doesPlayerExists(message.author.id).then(exists => {
                    // If it exists, execute the command
                    if(exists) {
                        client.commands.get(command).execute(message, args);
                    } else {
                        // If it doesn't exist, send a message to the user
                        const noCharacterEmbed = new EmbedBuilder()
                            .setColor('F08080')
                            .setAuthor({name: 'You do not have a character!'})
                            .addFields( { name: 'You need to create a character before you can use this command.', value: 'Use the `start` command to create a character.' })
                        
                        message.channel.send({embeds: [noCharacterEmbed]});
                        return;
                    }
                })
                
            } else {
                client.commands.get(command).execute(message, args);
            }
        } catch(error) {
            // Catch the error if there's a dev issue
            console.error(error);
            const errorEmbed = new EmbedBuilder()
            .setColor('FF0000')
            .setAuthor({name: 'Error!'})
            .addFields( { name: 'Something went wrong!', value: 'Please try again later.' });
            
            message.channel.send({embeds: [errorEmbed]});
        }
    }
}