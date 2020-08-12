const musicPlayer = require('../player/player').musicPlayer

module.exports = {
    name: 'skip',
    description: 'Skips to the next song in queue.',
    args: false,
    guildOnly: true,
    cooldown: 0,
    execute(message, args) {
        if (!message.member.voice.channel) {
            return message.channel.send('You must be in a voice channel to use this command!')
        }

        if (!musicPlayer.playing) {
            message.channel.send('Nothing is playing!')
            return
        }
        musicPlayer.skip(message)
    }
}