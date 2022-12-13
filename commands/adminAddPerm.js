const { Client, MessageEmbed } = require('discord.js');
const permsUtils = require('../utils/permsUtils.js');
const dbUtils = require('../utils/databaseUtils.js');


module.exports = {
    name : "addPerm",
    aliases: [],
    requiredPermission: ["admin.addPerm"],
    description: "",

    execute(message, args) {
        console.log(args);

        if (args.length < 1)
            return;

        permsUtils.checkPerms(args[0], args[1]).then(exists => {
             if(!exists) {
                 
                 message.reply('debug: added admin perm to this command to the user');
             } else {
                 message.reply('debug: user already has admin perm for this command');
             }
         });
    }
}