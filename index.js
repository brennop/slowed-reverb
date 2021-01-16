const Discord = require("discord.js");

const client = new Discord.Client();
const settings = {
  prefix: "~",
  token: "Nzk4NTUxNjU2OTI0NTc3ODQy.X_2rLw.t-O08X1GTNIDYkBgH_zZ99ZjDg4",
};

const { Player } = require("discord-player");

client.player = new Player(client);

client.player.filters = {
  ...client.player.filters,
  bassboost: "bass=g=10",
  vaporwave: "aresample=48000,asetrate=48000*0.85",
  reverb: "ladspa=gverb_1216:gverb:10|5|0.9|0.75|-4|-6",
  normalizer: "dynaudnorm=g=31",
};

client.player.on("queueCreate", (message, queue) => {
  queue.filters = {
    bassboost: true,
    vaporwave: true,
    reverb: true,
    normalizer: true,
  };
});

client.on("ready", () => {
  console.log("I'm ready !");
});

client.on("message", async (message) => {
  if (!message.content.startsWith(settings.prefix)) return;

  const args = message.content
    .slice(settings.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "play" || command === "p") {
    client.player.play(message, args.join(" "), true);
  }

  if (command === "queue" || command === "q") {
    const queue = client.player.getQueue(message);
    message.channel.send(queue);
  }

  if (command === "skip" || command === "s") {
    client.player.skip(message);
  }
});

client.player
  // Send a message when a track starts
  .on("trackStart", (message, track) =>
    message.channel.send(`Now playing ${track.title}...`)
  )

  // Send a message when something is added to the queue
  .on("trackAdd", (message, queue, track) =>
    message.channel.send(`${track.title} has been added to the queue!`)
  )
  .on("playlistAdd", (message, queue, playlist) =>
    message.channel.send(
      `${playlist.title} has been added to the queue (${playlist.tracks.length} songs)!`
    )
  )

  // Send messages to format search results
  .on("searchResults", (message, query, tracks) => {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`Here are your search results for ${query}!`)
      .setDescription(tracks.map((t, i) => `${i + 1}. ${t.title}`))
      .setFooter("Send the number of the song you want to play!");
    message.channel.send(embed);
  })
  .on("searchInvalidResponse", (message, query, tracks, content, collector) => {
    if (content === "cancel") {
      collector.stop();
      return message.channel.send("Search cancelled!");
    }

    message.channel.send(
      `You must send a valid number between 1 and ${tracks.length}!`
    );
  })
  .on("searchCancel", (message, query, tracks) =>
    message.channel.send(
      "You did not provide a valid response... Please send the command again!"
    )
  )
  .on("noResults", (message, query) =>
    message.channel.send(`No results found on YouTube for ${query}!`)
  )

  // Send a message when the music is stopped
  .on("queueEnd", (message, queue) =>
    message.channel.send(
      "Music stopped as there is no more music in the queue!"
    )
  )
  .on("channelEmpty", (message, queue) =>
    message.channel.send(
      "Music stopped as there is no more member in the voice channel!"
    )
  )
  .on("botDisconnect", (message) =>
    message.channel.send(
      "Music stopped as I have been disconnected from the channel!"
    )
  )

  // Error handling
  .on("error", (error, message) => {
    switch (error) {
      case "NotPlaying":
        message.channel.send("There is no music being played on this server!");
        break;
      case "NotConnected":
        message.channel.send("You are not connected in any voice channel!");
        break;
      case "UnableToJoin":
        message.channel.send(
          "I am not able to join your voice channel, please check my permissions!"
        );
        break;
      case "LiveVideo":
        message.channel.send("YouTube lives are not supported!");
        break;
      default:
        message.channel.send(`Something went wrong... Error: ${error}`);
    }
  });

client.login(settings.token);
