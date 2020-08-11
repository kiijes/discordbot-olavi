const musicPlayer = require('../player/player').musicPlayer

module.exports = {
    name: 'stop',
    description: 'Stops the playback of audio',
    args: false,
    guildOnly: true,
    cooldown: 0,
    execute(message, args) {
        musicPlayer.closeConnection()
    }
}