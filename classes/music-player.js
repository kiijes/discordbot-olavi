const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  StreamType,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { eventEmitter } = require("../instances/events");

class MusicPlayer {
  constructor(guildId) {
    this._guildId = guildId;
    this._dispatcher = null;
    this._queue = [];
    this._voiceChannel = null;
    this._playing = false;
    this._song = null;
    this._timeout = null;
    this._audioPlayer = null;
  }

  async play() {
    if (this.timeout !== null) {
      this.clearInstanceDeletionTimer();
    }

    if (this.audioPlayer === null) {
      this.logger("creating an audio player");
      this.audioPlayer = createAudioPlayer({
        behaviors: NoSubscriberBehavior.Play,
      });

      this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
        this.playNextSong();
      });
    }

    this.playing = true;

    let connection;

    if (!this.getGuildVoiceConnection()) {
      this.logger("joining a voice channel");

      const channelInfo = {
        channelId: this.voiceChannel.id,
        guildId: this.voiceChannel.guild.id,
        adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
      };

      connection = joinVoiceChannel(channelInfo);

      connection.on(VoiceConnectionStatus.Ready, () => {
        connection.subscribe(this.audioPlayer);
        this.playNextSong();
      });
    }
  }

  playNextSong() {
    const song = this.queue.shift();

    if (song === undefined) {
      return this.closeConnection();
    }

    this.song = song;
    this.audioPlayer.play(this.getSongResource(song));
    song.requestChannel.send(`Now playing \`${song.title}\``);
  }

  getGuildVoiceConnection() {
    return getVoiceConnection(this.voiceChannel.guild.id);
  }

  getSongResource(song) {
    return createAudioResource(
      ytdl(song.link, {
        quality: "highestaudio",
        highWaterMark: 1024 * 1024 * 5,
      }).on("finish", () => {
        this.logger("ytdl finished downloading");
      }),
      { inputType: StreamType.WebmOpus }
    );
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

  skip() {
    this.playNextSong();
  }

  closeConnection() {
    this.logger("closing connection and destroying resources");

    const connection = getVoiceConnection(this.voiceChannel.guild.id);
    connection.destroy();
    this.connection = null;

    this.audioPlayer.stop();
    this.audioPlayer = null;

    this.playing = false;
    this.song = null;
    this.setInstanceDeletionTimer(5);
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

  get audioPlayer() {
    return this._audioPlayer;
  }

  set audioPlayer(audioPlayer) {
    this._audioPlayer = audioPlayer;
  }
}

module.exports.MusicPlayer = MusicPlayer;
