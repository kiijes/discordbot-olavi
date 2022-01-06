const getMusicPlayer = require("../instances").getMusicPlayer;

module.exports = {
  name: "stop",
  description: "Stops the playback of audio",
  args: false,
  guildOnly: true,
  cooldown: 0,
  execute(message, args) {
    console.log(
      `[stop] getting the music player for guild id ${message.guild.id}`
    );
    let musicPlayer = getMusicPlayer(message.guild.id);

    if (musicPlayer === undefined) {
      console.log(`[stop] guild id ${message.guild.id} has no music player`);
      return message.channel.send(
        "Server has no active music player instance! Start playback to create a music player."
      );
    }

    if (!musicPlayer.connection) {
      return message.channel.send("There is nothing to stop!");
    }

    console.log(`[stop] stopping music player in guild id ${message.guild.id}`);
    musicPlayer.closeConnection();
  },
};
