import { Client } from "discord.js";
import { env } from "~/env";
import { db } from "~/packages/db";
import { accounts, communities, communityAdmins, communityPlatforms } from "~/packages/db/schema/public";
import { eq } from "drizzle-orm";
import { pinataClient } from "~/packages/clients/pinata";
import { mastraClient } from "~/packages/clients/mastra";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

console.log("Logging in to discord", env.DISCORD_TOKEN);
await client.login(env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log("Discord client ready");
});

client.on("guildCreate", async (guild) => {
    try {
        const owner = await guild.fetchOwner();

        const account = await db.primary.query.accounts.findFirst({
            where: eq(accounts.identifier, owner.id),
            with: {
                user: {
                    with: {
                        communities: true
                    }
                }
            }
        });

        if (!account || !account.user) {
            // TODO: Create user automatically in backend
            return;
        }

        if (account.user.communities.length === 0) {
            await db.primary.transaction(async (tx) => {
                const icon = guild.iconURL();

                const image = icon ? await pinataClient.upload.url(icon) : null;

                const [community] = await tx.insert(communities).values({
                    handle: guild.name.toLowerCase().replace(/ /g, "-"),
                    name: guild.name,
                    image: image?.IpfsHash ?? "",
                }).returning();

                await tx.insert(communityAdmins).values({
                    community: community.id,
                    // @ts-ignore User is defined up to this point
                    user: account.user.id,
                });

                await tx.insert(communityPlatforms).values({
                    community: community.id,
                    platform: "discord",
                    config: {
                        server: guild.id,
                    },
                });
            });
        }

        if (account.user.communities.length > 1) {
            // TODO: We don't know what community the user wants to use
            return owner.send(`Let's get you setup, please select which community you want to use with ${guild.name}`);

            // Use embeds to show the communities in drop down menu

        }

    } catch (error) {
    }
});

// Rooms are dms, channel:id

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
        const agent = await mastraClient.getAgent("dash");

        agent.generate({
            prompt: "Hello, how are you?",
            messages: [
                {
                    role: "user",
                    content: "Hello, how are you?",
                },
            ],
        });
        // TODO: Generate response
        // TODO: Send response
    }
});
