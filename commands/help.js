module.exports = {
  name: "help",
  description: "Show all the available commands.",
  args: false,
  guildOnly: true,
  cooldown: 5,
  execute(message, commands, prefix) {
    const helpFields = [];

    commands.forEach((command, commandName) => {
      helpFields.push({
        name: `${prefix}${commandName} ${command.usage ? "<args>" : ""}`,
        value: `${command.description} ${
          command.usage ? `\n**Arguments:** ${command.usage}` : ""
        }\n`,
      });
    });

    const helpEmbed = {
      color: 0x0099ff,
      title: `AVAILABLE COMMANDS`,
      fields: helpFields,
    };

    message.channel.send({ embeds: [helpEmbed] });
  },
};
