const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;
const { Permissions } = require("discord.js");

module.exports = {
  name: "clear_all",
  description: "Clears the entire music player queue",
  args: false,
  guildOnly: true,
  cooldown: 0,
  execute(message, args) {
    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
      return message.channel.send("Not privileged enough to use this command.");
    }

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
      return message.channel.send("Queue is already empty.");
    }

    console.log(`[clear] clearing queue in guild id ${message.guild.id}`);
    musicPlayer.clearQueue();
    message.channel.send("Cleared queue.");
  },
};
