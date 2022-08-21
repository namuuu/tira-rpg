const fs = require('fs');
const { Collection } = require('discord.js');


module.exports = {
    setupEvents(client) {
        const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`./../events/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.trigger(...args, client));
            } else {
                client.on(event.name, (...args) => event.trigger(...args, client));
            }
        }
    }
}