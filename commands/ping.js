module.exports = {
  name: "ping",
  description: "Ping.",
  args: false,
  guildOnly: true,
  cooldown: 10,
  execute(message, args) {
    message.channel.send("Pong");
  },
};
