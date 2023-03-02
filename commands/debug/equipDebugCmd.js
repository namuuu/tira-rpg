const equip = require('../../utils/equipUtils.js'); 

module.exports = {
  name: "debug-equip",
  aliases: [],
  description: "Debug command concerning equipments. Usage for developer only.",
  requireCharacter: true,
  execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "obtain":
            case "obtainw":
                equip.obtain(authorId, args[1], "weapon");
                break;
            case "obtainh":
                equip.obtain(authorId, args[1], "helmet");
                break;
            case "obtainc":
                equip.obtain(authorId, args[1], "chestplate");
                break;
            case "obtainb":
                equip.obtain(authorId, args[1], "boots");
                break;
            case "trash":
                equip.trash(authorId, args[1], args[2]);
                break;
            case "equip":
                equip.equip(authorId, args[1], args[2]);
                break;
            case "unequip":
                equip.unequip(authorId, args[1]);
                break;
            case "info":
                break;
            default:
                message.reply("Debug Command not found. Please specify a debug command according to the document.");
                break;
        }
    } catch (error) {
        console.log(error);
    }
    

    return;
  }
}