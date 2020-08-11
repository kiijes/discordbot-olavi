const eventEmitter = require('./play').eventEmitter

module.exports = {
    name: 'stop',
    description: 'Stops the playback of audio',
    args: false,
    guildOnly: true,
    cooldown: 0,
    execute(message, args) {
        eventEmitter.emit('stop music')
    }
}