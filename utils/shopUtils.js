const fs = require('fs');
const { EmbedBuilder } = require('discord.js');


exports.getShopData = function(shopName) {
    let fullShopData = JSON.parse(fs.readFileSync(`./data/shops.json`));
    let shopData = fullShopData[shopName];

    if(shopData == undefined) {
        return null;
    }

    if(shopData.date == undefined || shopData.date != new Date().getDate()) {
        shopData.date = new Date().getDate();
        fullShopData[shopName] = shopData;

        updateShopData(shopName, shopData);

        fs.writeFileSync(`./data/shops.json`, JSON.stringify(fullShopData, null, 4));
    }

    return shopData;
}

function updateShopData(shopName, shopData) {
    // Not implemented yet
}
