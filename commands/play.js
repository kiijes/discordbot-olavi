const ytdl = require('ytdl-core')
const fs = require('fs')
const EventEmitter = require('events').EventEmitter
const eventEmitter = new EventEmitter()

const checkLength = async (link) => {
    const url = link
    let options = { quality: 'highestaudio' }
    let info = await ytdl.getInfo(url, options)

    let promise = new Promise((resolve, reject) => {
        if (info.playerResponse.videoDetails.lengthSeconds > 850) {
            resolve([false, info.playerResponse.videoDetails.title])
        }
        resolve([true, info.playerResponse.videoDetails.title])
    })

    return await promise
}

const playAudio = async (message, link) => {
    let lengthOk = await checkLength(link)
    console.log('length ok: ' + lengthOk[0])
    if (!lengthOk[0]) return

    if (message.member.voice.channel) {
        try {
            const connection = await message.member.voice.channel.join()

            message.channel.send(`Now playing: \`${lengthOk[1]}\``)

            const dispatcher = connection.play(
                ytdl(link, { quality: 'highestaudio', highWaterMark: 1024 * 1024 * 5 })
                .on('finish', () => {
                    console.log('ytdl finished')
                })
                .on('error', error => console.log(error)),
                { type: 'webm/opus' }
            )

            dispatcher.on('finish', () => {
                console.log('dispatcher finish')
                connection.disconnect()
            })
    
            eventEmitter.on('stop music', () => {
                connection.disconnect()
                return
            })
        } catch (err) {
            console.error(err)
        }
        
    } else {
        message.channel.send('You need to be in a voice channel to use this command!')
        return
    }
}

module.exports = {
    name: 'play',
    description: 'Play a video from YouTube in your voice channel.',
    args: true,
    usage: '<YouTube URL>',
    guildOnly: true,
    cooldown: 0,
    execute(message, args) {
        playAudio(message, args[0])
    }
}

module.exports.eventEmitter = eventEmitter