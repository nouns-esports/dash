import { Client } from "discord.js";
import { env } from "~/env";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

console.log("Logging in to discord", env.DISCORD_TOKEN);
await client.login(env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log("Discord client ready");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!client.user) return;

    const mentioned = message.mentions.has(client.user.id);

    const author = message.author.username.split("#")[0];
    const mentions = message.mentions.users
        .filter((user) => user.id !== client.user?.id)
        .map((user) => user.username.split("#")[0]);
    const room = message.channel.id;
    const embeds: string[] = [];

    if (mentioned) {
      // TODO: Generate response
      // TODO: Send response
    }
});
