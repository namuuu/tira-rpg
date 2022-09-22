const fs = require("fs");

module.exports = {
    setupEvents(client) {
      console.log("-- EVENTS --");
        const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`./../events/${file}`);
            console.log("Loading event: " + event.name);
            if (event.once) {
                client.once(event.name, (...args) => event.trigger(...args, client));
            } else {
                client.on(event.name, (...args) => event.trigger(...args, client));
            }
        }
    }
}