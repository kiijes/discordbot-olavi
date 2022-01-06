const EventEmitter = require("events");
const deleteMusicPlayerInstance =
  require("./music-players").deleteMusicPlayerInstance;

const eventEmitter = new EventEmitter();

eventEmitter.on("delete music player", (guildId) => {
  console.log(
    `[events] got event 'delete music player' for guild id ${guildId}`
  );
  deleteMusicPlayerInstance(guildId);
});

module.exports.eventEmitter = eventEmitter;
