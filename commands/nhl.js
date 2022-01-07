const https = require("https");
const nhlLogoUrl = require("../config.json").nhlLogoUrl;
const prefix = require("../config.json").prefix;
const url = "https://statsapi.web.nhl.com/api/v1/schedule";

function returnEmoji(gameState) {
  let emoji = "";
  const formattedGameState = gameState.replace(/ /g, "").toLowerCase();

  switch (true) {
    case /^inprogress$/.test(formattedGameState):
      emoji = "🟢";
      break;
    case /^pre.?game$/.test(formattedGameState):
      emoji = "🔵";
      break;
    case /^scheduled$/.test(formattedGameState):
      emoji = "⏰";
      break;
    case /^final$/.test(formattedGameState):
      emoji = "🔴";
      break;
  }

  return emoji;
}

function formatDate(date) {
  const d = new Date(date);
  let year = d.getFullYear();
  let month = d.getMonth() < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
  let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();

  return `${year}-${month}-${day}`;
}

module.exports = {
  name: "nhl",
  description: "Get the NHL schedule for yesterday, today or tomorrow.",
  usage:
    "today, yesterday, tomorrow, <yyyy-mm-dd>, or leave empty to get today's games.",
  args: false,
  guildOnly: true,
  cooldown: 5,
  execute(message, args) {
    let fullDateFormatted = "";

    if (
      !/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])$/.test(args[0])
    ) {
      let date = Date.now();

      switch (args[0]) {
        case "yesterday":
          fullDateFormatted = formatDate(date - 24 * 60 * 60 * 1000);
          break;
        case "tomorrow":
          fullDateFormatted = formatDate(date + 24 * 60 * 60 * 1000);
          break;
        case "today":
        case undefined:
          fullDateFormatted = formatDate(date);
          break;
        default:
          return message.channel.send(
            "Argument given was invalid." +
              `\nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``
          );
      }
    } else {
      fullDateFormatted = args[0];
    }

    https.get(url + `?date=${fullDateFormatted}`, (res) => {
      res.setEncoding("utf-8");
      let body = "";
      res.on("data", (data) => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);

        if (!body.dates.length) {
          return message.channel.send({
            embed: {
              color: 0x0099ff,
              title: `Schedule for ${fullDateFormatted}`,
              description: "No games scheduled for this date.",
            },
          });
        }

        games = body.dates[0].games;
        gameFields = [];

        for (const game of games) {
          const gameDate = new Date(game.gameDate);
          const gameDateFormatted =
            `${
              gameDate.getHours() < 10
                ? "0" + gameDate.getHours()
                : gameDate.getHours()
            }` +
            `:${
              gameDate.getMinutes() < 10
                ? "0" + gameDate.getMinutes()
                : gameDate.getMinutes()
            }`;
          gameFields.push({
            name: `${gameDateFormatted} - ${game.teams.away.team.name} @ ${game.teams.home.team.name}`,
            value: `**Status:** ${returnEmoji(game.status.detailedState)} ▸ ${
              game.status.detailedState
            }`,
          });
        }

        const nhlEmbed = {
          color: 0x0099ff,
          title: `Schedule for ${fullDateFormatted}`,
          fields: gameFields,
          thumbnail: {
            url: nhlLogoUrl,
          },
          footer: {
            // the code to get the timezone is from:
            // https://www.w3resource.com/javascript-exercises/javascript-date-exercise-37.php
            text: `Times are in ${
              /\((.*)\)/.exec(new Date(Date.now()).toString())[1]
            }.`,
          },
        };

        message.channel.send({ embeds: [nhlEmbed] });
      });
    });
  },
};
