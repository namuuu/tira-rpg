const quests = require('../../utils/questUtils.js');

module.exports = {
  name: "debug-quest",
  aliases: [],
  description: "Debug command concerning quests. Usage for developer only.",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const author = message.author;
    const authorId = author.id;
    
    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "getName":
                if(args[1] != null)
                    message.reply(quests.getName(args[1])+ " ");
                else
                    message.reply("Quest's name required.");
                break;

            case "getDescription":
                if(args[1] != null)
                   message.reply(quests.getDescription(args[1])+ " ");
                else
                    message.reply("Quest's name required.");
                break;

            case "getRewards":
                if(args[1] != null){
                    if(quests.getRewards(args[1]).length == 0 ){
                        message.reply("Quest without rewards");
                    }else{
                        let rewards=""
                        for (let i = 0; i < quests.getRewards(args[1]).length; i++) {
                            if(i==0){
                                rewards+=`${ quests.getRewards(args[1])[0]}`
                            }else{
                                rewards+=`, ${quests.getRewards(args[1])[i]}`
                            }
                        }
                        rewards+="."
                        message.reply(rewards+ " ");
                    }             
                }     
                else{
                    message.reply("Quest's name required.");
                }
                   
                break;

        case "getNextQuest":
                if(args[1] != null)
                   message.reply(quests.getNextQuest(args[1])+ " ");
                else
                    message.reply("Quest's name required.");
                break;
        
        case "setStatus":
            if(args[1] != null){
                quests.updateData(authorId,args[i])
                message.reply(`Status ${args[1]} set`);
            }     
            else{
                message.reply("Error, need a status to set");
            }      
            break;

        case "giveQuest":
            if(args[1] != null){
                quests.giveQuest(authorId,args[1])
                message.reply(`Quest ${args[1]} gave`);
            }     
            else{
                message.reply("Error, need a quest to give");
            }      
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