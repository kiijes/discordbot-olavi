const ytdl = require("ytdl-core");
const { eventEmitter } = require("../instances/events");

class MusicPlayer {
  constructor(guildId) {
    this._guildId = guildId;
    this._connection = null;
    this._dispatcher = null;
    this._queue = [];
    this._voiceChannel = null;
    this._playing = false;
    this._song = null;
    this._timeout = null;
  }

  async play() {
    if (this.timeout !== null) {
      this.clearInstanceDeletionTimer();
    }

    this.playing = true;

    if (!this.connection) {
      this.connection = await this.voiceChannel.join();
    }

    const song = this.queue.shift();

    this.song = song;

    this.dispatcher = this.connection.play(
      ytdl(song.link, {
        quality: "highestaudio",
        highWaterMark: 1024 * 1024 * 5,
      }).on("finish", () => {
        this.logger("ytdl finished downloading");
      })
    );

    song.requestChannel.send(`Now playing \`${song.title}\``);

    this.dispatcher.on("finish", () => {
      this.logger("dispatcher finished playing");
      this.playing = false;
      this.song = null;

      if (!this.queue.length) {
        this.closeConnection();
        return;
      }

      this.logger("songs in queue, playing next one");
      this.play();
    });

    this.dispatcher.on("error", (error) => {
      this.logger(error);
      this.playing = false;
      this.closeConnection();
    });
  }

  async pushIntoQueue(url, textChannel, memberId, memberName) {
    return new Promise(async (resolve, reject) => {
      const ytRegex =
        /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]{11}$|^https?:\/\/youtu\.be\/[\w-]{11}$|^[\w-]{11}$/;

      if (!ytRegex.test(url)) {
        textChannel.send("Not an acceptable YouTube link.");
        resolve(false);
        return;
      }

      let checkLengthResults = await this.checkLength(url);
      if (!checkLengthResults[0]) {
        textChannel.send("Song is too long! Limit is 1hr 1min.");
        resolve(false);
        return;
      }

      this.queue.push({
        link: url,
        title: checkLengthResults[1],
        requestChannel: textChannel,
        addedById: memberId,
        addedByName: memberName,
      });
      textChannel.send(
        `**${memberName}** added \`${checkLengthResults[1]}\` to queue.`
      );
      resolve(true);
    });
  }

  async checkLength(url) {
    return new Promise(async (resolve, reject) => {
      let options = {
        quality: "highestaudio",
      };
      let info = await ytdl.getInfo(url, options);
      let playerResponse = info.player_response;

      if (playerResponse.videoDetails.lengthSeconds > 3660) {
        resolve([false, playerResponse.videoDetails.title]);
        return;
      }
      resolve([true, playerResponse.videoDetails.title]);
    });
  }

  skip(message) {
    this.dispatcher.destroy();
    if (!this.queue.length) {
      message.channel.send("No more songs in queue, stopping!");
      this.closeConnection();
      return;
    }
    this.play();
  }

  closeConnection() {
    this.logger("closing connection");
    this.connection.disconnect();
    this.connection = null;
    this.playing = false;
    this.song = null;
    this.setInstanceDeletionTimer(2);
  }

  sendMessage(channel, message) {
    channel.send(message);
  }

  logger(logMessage) {
    console.log(`[music player] ${logMessage} [guild id ${this.guildId}]`);
  }

  clearQueue() {
    this.queue = [];
  }

  removeSongFromQueueByIndex(index) {
    this.queue.splice(index, 1);
  }

  setInstanceDeletionTimer(minutes) {
    this.logger(`setting ${minutes} minute timer for instance deletion`);
    this.timeout = setTimeout(() => {
      eventEmitter.emit("delete music player", this.guildId);
    }, 1000 * 60 * minutes);
  }

  clearInstanceDeletionTimer() {
    this.logger("clearing instance deletion timer");
    clearTimeout(this.timeout);
    this.timeout = null;
  }

  get queue() {
    return this._queue;
  }

  set queue(queue) {
    this._queue = queue;
  }

  get dispatcher() {
    return this._dispatcher;
  }

  set dispatcher(dispatcher) {
    this._dispatcher = dispatcher;
  }

  get voiceChannel() {
    return this._voiceChannel;
  }

  set voiceChannel(channel) {
    this._voiceChannel = channel;
  }

  get connection() {
    return this._connection;
  }

  set connection(connection) {
    this._connection = connection;
  }

  get guildId() {
    return this._guildId;
  }

  get playing() {
    return this._playing;
  }

  set playing(status) {
    this._playing = status;
  }

  get song() {
    return this._song;
  }

  set song(song) {
    this._song = song;
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(timeout) {
    this._timeout = timeout;
  }
}

module.exports.MusicPlayer = MusicPlayer;
