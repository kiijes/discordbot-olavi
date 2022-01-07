const { Client, Intents, Collection } = require("discord.js");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  partials: ["MESSAGE", "CHANNEL"],
});
const config = require("./config.json");
const fs = require("fs");

// Create a collection and load commands into it
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Loop the command files and add them to the client's commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Collection of cooldowns to check whether user can use command
const cooldowns = new Collection();

// Load chat prefix and token from config
const prefix = config.prefix;
const token = config.token;

client.once("ready", () => {
  console.log("ready!");
  client.user.setActivity(`kkona ttunes`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (message.channel.type === "DM") {
    return message.author.send(
      "I don't do DM's, silly.\nhttps://www.youtube.com/watch?v=d_4Cfl8xNeo"
    );
  }

  if (!client.commands.has(commandName)) {
    return message.channel.send("I know no such thing.");
  }

  const command = client.commands.get(commandName);

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${commandName} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the command \`${command.name}\``
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    if (commandName === "help") {
      command.execute(message, client.commands, prefix);
    } else {
      command.execute(message, args);
    }
  } catch (error) {
    console.error(error);
    message.reply("Error executing command!");
  }
});

client.login(token);
