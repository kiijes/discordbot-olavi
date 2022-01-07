const MusicPlayer = require("../classes/music-player").MusicPlayer;
const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const setMusicPlayerInstance =
  require("../instances/music-players").setMusicPlayerInstance;
const QUEUE_SIZE_LIMIT = require("../constants").QUEUE_SIZE_LIMIT;

module.exports = {
  name: "play",
  description: `Play and queue up to ${QUEUE_SIZE_LIMIT} songs from YouTube.`,
  args: false,
  usage:
    "<YouTube URL>, or leave empty to resume playback if queue has songs and playback is stopped.",
  guildOnly: true,
  cooldown: 0,
  async execute(message, args) {
    if (!message.member.voice.channel) {
      return message.channel.send(
        "You must be in a voice channel to use this command."
      );
    }

    console.log(
      `[play] getting the music player for guild id ${message.guild.id}`
    );
    let musicPlayer = getMusicPlayerInstance(message.guild.id);

    if (musicPlayer === undefined) {
      console.log(
        `[play] guild id ${message.guild.id} has no music player; creating one now`
      );
      musicPlayer = new MusicPlayer(message.guild.id);
      setMusicPlayerInstance(message.guild.id, musicPlayer);
    }

    if (!musicPlayer.voiceChannel) {
      musicPlayer.voiceChannel = message.member.voice.channel;
    }

    if (!args.length && !musicPlayer.queue.length) {
      message.channel.send("No songs in queue to resume.");
      return;
    }

    if (musicPlayer.queue.length === QUEUE_SIZE_LIMIT) {
      return message.channel.send(
        `Queue is full! Limit is ${QUEUE_SIZE_LIMIT} video(s).`
      );
    }

    if (args.length > 0) {
      if (
        !(await musicPlayer.pushIntoQueue(
          args[0],
          message.channel,
          message.member.id,
          message.member.displayName
        ))
      )
        return;
    }

    if (!musicPlayer.playing) {
      musicPlayer.play();
    }
  },
};
