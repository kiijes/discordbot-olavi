const { Player, MusicPlayer } = require("../player/player");

const musicPlayers = new Map();

module.exports.createMusicPlayer = (guildId) => {
  const musicPlayer = new MusicPlayer(guildId);
  musicPlayers.set(guildId, musicPlayer);
  return musicPlayer;
};

module.exports.getMusicPlayer = (guildId) => {
  return musicPlayers.get(guildId);
};

module.exports.removeMusicPlayer = (guildId) => {
  musicPlayers.delete(guildId);
};
