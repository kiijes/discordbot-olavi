const getMusicPlayerInstance =
  require("../instances/music-players").getMusicPlayerInstance;
const deleteMusicPlayerInstance =
  require("../instances/music-players").deleteMusicPlayerInstance;

module.exports = {
  name: "skip",
  description: "Skips to the next song in queue.",
  args: false,
  guildOnly: true,
  cooldown: 0,
  execute(message, args) {
    console.log(
      `[skip] getting the music player for guild id ${message.guild.id}`
    );
    let musicPlayer = getMusicPlayerInstance(message.guild.id);

    if (musicPlayer === undefined) {
      console.log(`[skip] guild id ${message.guild.id} has no music player`);
      return message.channel.send(
        "Server has no active music player instance! Start playback to create a music player."
      );
    }

    if (!message.member.voice.channel) {
      return message.channel.send(
        "You must be in a voice channel to use this command."
      );
    }

    if (!musicPlayer.playing) {
      message.channel.send("Nothing is playing!");
      return;
    }

    if (musicPlayer.song.addedById === message.member.id) {
      console.log(`[skip] song was added by member; skipping`);
      musicPlayer.skip(message);
      return;
    } else if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
      console.log(
        `[skip] song not added by member & member doesn't have permissions to skip`
      );
      message.channel.send("You do not have permissions to skip this song.");
      return;
    } else {
      console.log(`[skip] member has permissions; force skip`);
      musicPlayer.skip(message);
    }
  },
};
