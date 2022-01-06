const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;

module.exports = {
  name: "playing",
  description: "Shows the currently playing song",
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

    const song = musicPlayer.song;

    if (song === null) {
      return message.channel.send("Nothing is currently playing.");
    }

    const nowPlayingEmbed = {
      color: 0x0099ff,
      fields: [
        {
          name: `NOW PLAYING`,
          value: `**Song:** ${song.title}\n**Added by:** ${song.addedByName}`,
        },
      ],
    };

    message.channel.send({ embeds: [nowPlayingEmbed] });
  },
};
