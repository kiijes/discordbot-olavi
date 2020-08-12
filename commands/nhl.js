const https = require('https')
const nhlLogoUrl = require('../config.json').nhlLogoUrl
const prefix = require('../config.json').prefix
const url = 'https://statsapi.web.nhl.com/api/v1/schedule'

function returnEmoji(gameState) {
    let emoji = ''
    const formattedGameState = gameState.replace(/ /g, '').toLowerCase()

    switch (true) {
        case /^inprogress$/.test(formattedGameState):
            emoji = '🔴'
            break
        case /^pre.?game$/.test(formattedGameState):
            emoji = '🔵'
            break
        case /^scheduled$/.test(formattedGameState):
            emoji = '⏰'
            break
        case /^final$/.test(formattedGameState):
            emoji = '🟢'
            break
    }

    return emoji
}

function formatDate(date) {
    const d = new Date(date)
    let year = d.getFullYear()
    let month = d.getMonth() < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)
    let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()

    return `${year}-${month}-${day}`
}

module.exports = {
    name: 'nhl',
    description: 'Get the NHL schedule for yesterday, today or tomorrow.',
    usage: 'today (or leave empty) | yesterday | tomorrow',
    args: false,
    guildOnly: true,
    cooldown: 5,
    execute(message, args) {
        let fullDateFormatted = ''

        switch (args[0]) {
            case 'yesterday':
                fullDateFormatted = formatDate(Date.now() - 24*60*60*1000)
                break
            case 'tomorrow':
                fullDateFormatted = formatDate(Date.now() + 24*60*60*1000)
                break
            case 'today':
            case undefined:
                fullDateFormatted = formatDate(Date.now())
                break
            default:
                return message.channel.send('Argument given was invalid.' + `\nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``)
        }
        
        https.get(url + `?date=${fullDateFormatted}`, res => {
            res.setEncoding('utf-8')
            let body = ''
            res.on('data', data => {
                body += data
            });
            res.on('end', () => {
                body = JSON.parse(body)
                games = body.dates[0].games
                gameFields = []

                for (const game of games) {
                    const gameDate = new Date(game.gameDate)
                    const gameDateFormatted = 
                        `${gameDate.getHours() < 10 ? '0' + gameDate.getHours() : gameDate.getHours()}` +
                        `:${gameDate.getMinutes() < 10 ? '0' + gameDate.getMinutes() : gameDate.getMinutes()}`
                    gameFields.push(
                        {
                            'name': `${gameDateFormatted} - ${game.teams.away.team.name} @ ${game.teams.home.team.name}`,
                            'value': `**Status:** ${game.status.detailedState} ${returnEmoji(game.status.detailedState)}`
                        }
                    )
                }

                const nhlEmbed = {
                    color: 0x0099ff,
                    title: `Schedule for ${fullDateFormatted}`,
                    fields: gameFields,
                    thumbnail: {
                        url: nhlLogoUrl
                    }
                }

                message.channel.send({ embed: nhlEmbed })
            })
        })
    }
}