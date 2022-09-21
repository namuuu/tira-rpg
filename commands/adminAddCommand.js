const { Client, MessageEmbed } = require('discord.js');
const permsUtils = require('../utils/permsUtils.js');

module.exports = {
    name : "add",
    aliases: [],
    description: "",

    execute(message, args) {
        console.log(args);

        if (args.length < 1)
            return;

        permsUtils.addAdmin(args);
        message.reply('debug: added admin perm to command');

        // dbUtils.doesCommandExists(args).then(exists => {
        //     if(!exists) {
        //         dbUtils.addAdmin(args);
        //         message.reply('debug: added admin perm to command');
        //     } else {
        //         message.reply('debug: command already has admin perm ');
        //     }
        // });
    }
}