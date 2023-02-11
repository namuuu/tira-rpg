const player = require('../utils/playerUtils');

module.exports = {
  name: "delete",
  aliases: [],
  description: "",
  requiredPermission: [""],
  execute(message, args) {
    console.log(args);

    if (args.length < 1)
      return;

    const arg = message.mentions.members.first();

    if (!arg)
      return;

    const id = arg.id;
    
    player.doesExists(id).then(exists => {
      if (exists) {
        player.remove(id);
        message.reply('debug: deleted player');

        return;

      } else {

        message.reply('debug: no player to delete');
        return;
      }
    });
  }
}