const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;

module.exports = {
  name: "clear",
  description: "Clears all the songs queued by the user.",
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
      return message.channel.send("Queue is already empty.");
    }

    console.log(
      `[clear] clearing songs added by member id ${message.member.id} from the queue in guild id ${message.guild.id}`
    );
    for (let i = 0; i < musicPlayer.queue.length; i = i) {
      if (musicPlayer.queue[i].addedById === message.member.id) {
        musicPlayer.removeSongFromQueueByIndex(i);
      } else {
        i++;
      }
    }
    message.channel.send(
      `Removed ${message.member.displayName}'s songs from the queue.`
    );
  },
};
