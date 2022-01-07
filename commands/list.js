const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;

module.exports = {
  name: "list",
  description: "Lists all the songs in queue.",
  args: false,
  guildOnly: true,
  cooldown: 0,
  execute(message, args) {
    console.log(
      `[clear] getting the music player for guild id ${message.guild.id}`
    );
    let musicPlayer = getMusicPlayerInstance(message.guild.id);

    if (musicPlayer === undefined) {
      console.log(`[clear] guild id ${message.guild.id} has no music player`);
      return message.channel.send(
        "Server has no active music player instance! Start playback to create a music player."
      );
    }

    if (musicPlayer.queue.length === 0) {
      return message.channel.send("No songs in queue.");
    }

    console.log(
      `[clear] listing songs in queue in guild id ${message.guild.id}`
    );

    // Embed for currently playing song, if any
    const song = musicPlayer.song;

    let nowPlayingField;

    if (song === null) {
      nowPlayingField = {
        name: `NOW PLAYING`,
        value: `Silence. Nothing is playing.`,
      };
    } else {
      nowPlayingField = {
        name: `NOW PLAYING`,
        value: `**Song:** ${song.title}\n**Added by:** ${song.addedByName}`,
      };
    }

    const nowPlayingEmbed = {
      color: 0x0099ff,
      fields: [nowPlayingField],
    };

    // Embed for song queue
    let songFields = [];

    musicPlayer.queue.forEach((song, index) => {
      songFields.push({
        name: `${song.title}`,
        value: `Added by ${song.addedByName}`,
      });
    });

    const queueListEmbed = {
      color: 0x0099ff,
      title: "CURRENT QUEUE",
      fields: songFields,
    };

    message.channel.send({ embeds: [nowPlayingEmbed, queueListEmbed] });
  },
};
