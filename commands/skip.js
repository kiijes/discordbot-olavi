const eventEmitter = require('./play').eventEmitter

module.exports = {
    name: 'skip',
    description: 'Skips to the next song in queue',
    args: false,
    guildOnly: true,
    cooldown: 0,
    execute(message, args) {
        eventEmitter.emit('skip')
    }
}