const { Client, MessageEmbed } = require('discord.js');
const permsUtils = require('../utils/permsUtils.js');

module.exports = {
    name : "add",
    aliases: [],
    requiredPermission: ["admin.add"],
    description: "Ajouter des permissions admin à une commande",


    execute(message, args) {
        console.log(args);

        if (args.length < 1)
            return;
            
            permsUtils.doesPermExists(args).then(exists => {
                if(!exists) {
                    permsUtils.addAdmin(args[0]);
                    message.reply('debug: added admin perm to this command to the user');
                } else {
                    message.reply('debug: user already has admin perm for this command');
                }
            });
    }
}