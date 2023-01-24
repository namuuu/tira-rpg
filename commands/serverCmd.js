const serverUtil = require('../utils/serverUtils.js');

module.exports = {
  name: "server",
  aliases: [],
  description: "Update your server settings regarding Tira's RPG !",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a server command !");
        return;
    }

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "register":
                serverUtil.registerServer(message.guildId);
                break;
            case "get-data":
                console.log("yea");
                const data = await serverUtil.getServerData(message.guildId, {});
                console.log(data);
                break;
            default:
                message.reply("Please specify a valid server command !");
                break;
        }
    } catch (error) {
        console.log(error);
    }
    

    return;
  }
}