const musicPlayer = require('../player/player').musicPlayer

module.exports = {
    name: 'play',
    description: 'Play a video from YouTube in your voice channel.',
    args: true,
    usage: '<YouTube URL>',
    guildOnly: true,
    cooldown: 0,
    async execute(message, args) {
        await musicPlayer.pushIntoQueue(args[0], message.channel)

        if (!musicPlayer.voiceChannel) {
            musicPlayer.voiceChannel = message.member.voice.channel
        }

        if (!musicPlayer.connection) {
            musicPlayer.play()
        }
    }
}