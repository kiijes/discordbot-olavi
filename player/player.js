const ytdl = require('ytdl-core')

class Player {
    constructor() {
        this._connection = null
        this._dispatcher = null
        this._queue = []
        this._voiceChannel = null
        this._playing = false;
    }

    async play() {
        this.playing = true

        if (!this.connection) {
            this.connection = await this.voiceChannel.join()
        }

        const song = this.queue.shift()

        this.dispatcher = this.connection.play(
            ytdl(song.link, { quality: 'highestaudio', highWaterMark: 1024 * 1024 * 5 })
            .on('finish', () => { console.log('ytdl finished downloading') })
        )

        song.requestChannel.send(`Now playing \`${song.title}\``)

        this.dispatcher.on('finish', () => {
            console.log('dispatcher finished playing')
            this.playing = false

            if (!this.queue.length) {
                this.closeConnection()
                return
            }

            console.log('songs in queue, playing next one')
            this.play()
        })

        this.dispatcher.on('error', (error) => {
            console.log(error)
            this.playing = false
            this.closeConnection()
        })
    }

    async pushIntoQueue(url, textChannel) {
        let promise = new Promise(async (resolve, reject) => {
            let checkLengthResults = await this.checkLength(url)
            if (!checkLengthResults[0]) {
                textChannel.send('Song is too long! Limit is 1hr 1min.')
                resolve(false)
                return
            }
    
            this.queue.push({ link: url, title: checkLengthResults[1], requestChannel: textChannel })
            textChannel.send(`Added \`${checkLengthResults[1]}\` to queue.`)
            resolve(true)
        })

        return await promise
    }

    async checkLength(url) {
        let options = {
            quality: 'highestaudio'
        }
        let info = await ytdl.getInfo(url, options)
    
        let promise = new Promise((resolve, reject) => {
            if (info.playerResponse.videoDetails.lengthSeconds > 3660) {
                resolve([false, info.playerResponse.videoDetails.title])
                return
            }
            resolve([true, info.playerResponse.videoDetails.title])
        })
    
        return await promise
    }

    skip(message) {
        this.dispatcher.destroy()
        if (!this.queue.length) {
            message.channel.send('No more songs in queue, stopping!')
            this.closeConnection()
            return
        }
        this.play()
    }

    get queue() {
        return this._queue
    }

    get dispatcher() {
        return this._dispatcher
    }

    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher
    }

    get voiceChannel() {
        return this._voiceChannel
    }

    set voiceChannel(channel) {
        this._voiceChannel = channel
    }

    closeConnection() {
        this.connection.disconnect()
        this.connection = null
        this.playing = false
    }

    get connection() {
        return this._connection
    }

    set connection(connection) {
        this._connection = connection
    }

    sendMessage(channel, message) {
        channel.send(message)
    }

    get playing() {
        return this._playing
    }

    set playing(status) {
        this._playing = status
    }
}

const musicPlayer = new Player();
module.exports.musicPlayer = musicPlayer;