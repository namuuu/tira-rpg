module.exports = {
    setup: function(client) {
            // Setup commands
    const { setupCommands } = require('./setup/commandSetup.js');
    setupCommands(client, process.env.BOT_TOKEN, process.env.APP_ID);

    // Setup events
    const { setupEvents } = require('./setup/eventSetup.js');
    setupEvents(client);

    // Setup Abilities
    const { setupAbilities } = require('./setup/abilitySetup.js');
    setupAbilities(client);

    const { setupEquipment } = require('./setup/equipSetup.js');
    setupEquipment(client);

    const { setupCaracteristics } = require('./setup/caracteristicsSetup.js');
    setupCaracteristics(client);

    const { setupButtons } = require('./events/buttonEvent.js');
    setupButtons(client);

    const { setupStringSelect } = require('./events/dropdownEvent.js');
    setupStringSelect(client);
    }
}
