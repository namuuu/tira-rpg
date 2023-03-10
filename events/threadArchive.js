const { AuditLogEvent } = require('discord.js');
const manager = require('../manager/combatManager.js');
const combat = require('../utils/combatUtils.js');

module.exports = {
    name: 'threadUpdate',
    async trigger(oldThread, newThread) {

        // Check if the thread has been locked or archived
        if(oldThread.locked == newThread.locked && oldThread.archived == newThread.archived)
            return;

        // Check if it has been unlocked or unarchived
        if(oldThread.archived || oldThread.locked)
            return;

        const fetchedLogs = await newThread.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ThreadUpdate,
          });
        
          const log = fetchedLogs.entries.first();
        
          if (!log) {
            return console.log(
              'A thread was updated, but no relevant audit logs were found.',
            );
          }
          if (log.target.id === newThread.id) {
            console.log(`A thread was updated by ${log.executor?.tag}.`);
          }

          console.log(log);
    }
};