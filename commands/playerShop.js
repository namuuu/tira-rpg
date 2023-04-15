const messageUtils = require('../utils/messageTemplateUtils.js');

module.exports = {
    name: "shop",
    description: "",
    requireCharacter: true,
    execute(message, args) {

            messageUtils.generateShopSelector(message);
        
            return;
    }
}