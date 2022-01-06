const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;
const { Permissions } = require("discord.js");

module.exports = {
  name: "stop",
  description: "Stops the playback of audio",
  args: false,
  guildOnly: true,
  cooldown: 0,
  execute(message, args) {
    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
      return message.channel.send("Not privileged enough to use this command.");
    }

    console.log(
      `[stop] getting the music player for guild id ${message.guild.id}`
    );
    let musicPlayer = getMusicPlayerInstance(message.guild.id);

    if (musicPlayer === undefined) {
      console.log(`[stop] guild id ${message.guild.id} has no music player`);
      return message.channel.send(
        "Server has no active music player instance! Start playback to create a music player."
      );
    }

    if (!musicPlayer.getGuildVoiceConnection()) {
      return message.channel.send("There is nothing to stop!");
    }

    console.log(`[stop] stopping music player in guild id ${message.guild.id}`);
    musicPlayer.closeConnection();
  },
};
