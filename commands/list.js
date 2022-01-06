const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;

module.exports = {
  name: "list",
  description: "Lists the songs in queue",
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
    let queueString = "Songs in queue:```\n";
    musicPlayer.queue.forEach((song, index) => {
      queueString += `${index + 1}: ${song.title} — added by ${
        song.addedByName
      }\n`;
    });
    queueString += "```";

    message.channel.send(queueString);
  },
};
