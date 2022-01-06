const musicPlayers = new Map();

const setMusicPlayerInstance = (guildId, musicPlayer) => {
  musicPlayers.set(guildId, musicPlayer);
};

const getMusicPlayerInstance = (guildId) => {
  return musicPlayers.get(guildId);
};

const deleteMusicPlayerInstance = (guildId) => {
  console.log(
    `[music-players] music player instance deletion successful? ${musicPlayers.delete(
      guildId
    )}`
  );
};

module.exports.setMusicPlayerInstance = setMusicPlayerInstance;
module.exports.getMusicPlayerInstance = getMusicPlayerInstance;
module.exports.deleteMusicPlayerInstance = deleteMusicPlayerInstance;
