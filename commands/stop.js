const musicPlayer = require('../player/player').musicPlayer

module.exports = {
    name: 'stop',
    description: 'Stops the playback of audio',
    args: false,
    guildOnly: true,
    cooldown: 0,
    execute(message, args) {
        if (!musicPlayer.connection) {
            return message.channel.send('There is nothing to stop!')
        }
        musicPlayer.closeConnection()
    }
}