module.exports = {
    setup: function(client) {
            // Setup commands
    const { setupCommands } = require('./setup/commandSetup.js');
    setupCommands(client, process.env.BOT_TOKEN, process.env.APP_ID);

    // Setup events
    const { setupEvents } = require('./setup/eventSetup.js');
    setupEvents(client);

    // Setup Skills
    const { setupSkills } = require('./setup/skillSetup.js');
    setupSkills(client);

    const { setupEquipment } = require('./setup/equipSetup.js');
    setupEquipment(client);

    const { setupCaracteristics } = require('./setup/caracteristicsSetup.js');
    setupCaracteristics(client);

    const { setup } = require('./events/buttonSelectMenu.js');
    setup(client);
    }
}
