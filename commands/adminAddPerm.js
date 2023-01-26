const permsUtils = require('../utils/permsUtils.js');

module.exports = {
    name : "addperm",
    aliases: [],
    description: "",

    execute(message, args) {

        if (args.length < 1)
            return;

        const arg = message.mentions.members.first();

        if (arg == undefined) {
            message.reply('debug: no good arguments :((');
            return;
        }
        const id = arg.id;

        permsUtils.hasPerms(args[0], id).then(exists => {
            console.log("addperm : " + exists);
             if(!exists) {
                 permsUtils.addToCommand(args[0], id);
                 message.reply('debug: added admin perm to this command to the user');
             } else {
                 message.reply('debug: user already has admin perm for this command');
             }
         });
    }
}