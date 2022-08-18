import "dotenv/config";
import { searchMovie, getMovieData } from "../utils/Fushaar.js";
import { decode } from "html-entities";
import {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
} from "discord.js";

const EMOJIS = {
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
};
const ALIAS = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
};

const botClient = new Client({
  intents: [],
  presence: {
    status: "dnd",
    activities: [
      {
        type: ActivityType.Listening,
        name: "Sweety's Orders",
      },
    ],
  },
});

botClient
  .on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      const args = interaction.customId.split("-");
      switch (args[0]) {
        case "select":
          const movieUrl = decodeURIComponent(args.slice(1).join("-"));
          interaction.deferUpdate();
          await botClient.channels.fetch(interaction.channelId);
          const movieData = await getMovieData(movieUrl);
          interaction.message.edit({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: botClient.user.username,
                  iconURL: botClient.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle(movieData.title)
                .setDescription(
                  `>>> **\`\`\`fix\n${decode(movieData.description)}\`\`\`**`
                )
                .addFields([
                  {
                    name: "About 🤔",
                    value: `>>> **Release Date: \`${movieData.year}\`\nLength: \`${movieData.length}m\`\nPG: \`${movieData.pg}\`\nRating: \`${movieData.rating}\`**`,
                    inline: true,
                  },
                  {
                    name: "Categories 🗂️",
                    value: movieData.genres
                      .map(
                        (category) =>
                          `> **[${category.title}](${category.url})**`
                      )
                      .join("\n"),
                    inline: true,
                  },
                ])
                .setURL(movieUrl)
                .setColor("Green")
                .setThumbnail(movieData.banner),
            ],
            components: [
              new ActionRowBuilder().setComponents([
                new ButtonBuilder()
                  .setEmoji("📺")
                  .setLabel("Watch")
                  .setStyle(ButtonStyle.Link)
                  .setURL(
                    `https://www.fushaar.com/assets/themes/fushaarV5/player.php?id=${movieData.watch}`
                  ),
              ]),
            ],
          });
          break;
      }
    }
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "movie":
          {
            const name = interaction.options.getString("name", true);
            const movies = (await searchMovie(name)).slice(0, 3);
            interaction.reply({
              content: interaction.user.toString(),
              embeds: movies.map((movie, index) =>
                new EmbedBuilder()
                  .setAuthor({
                    name: decode(movie.title),
                    iconURL: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/keycap-digit-${
                      ALIAS[index + 1]
                    }_${31 + index}-fe0f-20e3.png`,
                    url: movie.url,
                  })
                  .setThumbnail(movie.art)
                  .addFields([
                    {
                      name: "Categories 🗂️",
                      value: movie.genres
                        .map(
                          (category) =>
                            `> **[${category.title}](${category.url})**`
                        )
                        .join("\n"),
                      inline: true,
                    },
                    {
                      name: "More",
                      value: `>>> **PG: ${movie.pg}\nReleased: ${
                        movie.year
                      }\nTranslated: ${movie.translated ? "✅" : "❌"}**`,
                      inline: true,
                    },
                  ])
                  .setColor("Green")
              ),
              components: [
                new ActionRowBuilder()
                  .addComponents(
                    movies.map((movie, index) =>
                      new ButtonBuilder()
                        .setCustomId("select-" + encodeURIComponent(movie.url))
                        .setEmoji(EMOJIS[index + 1])
                        .setStyle(ButtonStyle.Secondary)
                    )
                  )
                  .addComponents([
                    new ButtonBuilder()
                      .setLabel("More")
                      .setStyle(ButtonStyle.Link)
                      .setURL(
                        `https://www.fushaar.com/?s=${encodeURIComponent(name)}`
                      ),
                  ]),
              ],
            });
          }
          break;
      }
    }
  })
  .login(process.env.TOKEN);

import express from "express";
// HEROKU KEEP ALIVE
if (process.env.LISTEN) {
  express().listen(process.env.PORT || 80);
}
