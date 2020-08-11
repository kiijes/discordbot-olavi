module.exports = {
    name: 'ping',
    description: 'Ping command',
    args: true,
    usage: '<pong> <pung>',
    guildOnly: true,
    cooldown: 10,
    execute(message, args) {
        message.channel.send('Pong')
    }
}