const { AuditLogEvent } = require('discord.js');
const manager = require('../manager/combatManager.js');
const combat = require('../utils/combatUtils.js');

module.exports = {
    name: 'threadDelete',
    async trigger(thread) {
        if(combat.getCombatCollection(thread.id) != null) {
            manager.deleteCombat(thread);
        }
    }
};