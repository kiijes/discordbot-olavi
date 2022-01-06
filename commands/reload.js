module.exports = {
  name: "reload",
  description: "Reload a command.",
  args: true,
  usage: "<command name>",
  guildOnly: true,
  cooldown: 0,
  execute(message, args) {
    if (!args.length)
      return message.channel.send(`You didn't pass any command to reload!`);

    const commandName = args[0].toLowerCase();
    const command = message.client.commands.get(commandName);
    if (!command)
      return message.channel.send(
        `There is no command with the name \`${commandName}\`!`
      );

    delete require.cache[require.resolve(`./${command.name}.js`)];

    try {
      const newCommand = require(`./${command.name}.js`);
      message.client.commands.set(newCommand.name, newCommand);
      message.channel.send(`Reloaded command \`${command.name}\`!`);
    } catch (error) {
      console.log(error);
      message.channel.send(
        `There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``
      );
    }
  },
};
