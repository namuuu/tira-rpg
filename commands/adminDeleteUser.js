const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
  name: "delete",
  aliases: [],
  description: "",
  requiredPermission: ["admin.add"],
  execute(message, args) {
    console.log(args);

    if (args.length < 1)
      return;

    const arg = message.mentions.members.first();

    if (!arg)
      return;

    const id = arg.id;
    dbUtils.doesPlayerExists(id).then(exists => {
      if (exists) {
        dbUtils.removePlayer(id);
        message.reply('debug: deleted player');

        return;

      } else {

        message.reply('debug: no player to delete');
        return;
      }
    });
  }
}