import { ActionRowBuilder, Client, StringSelectMenuBuilder } from "discord.js";
import { env } from "~/env";
import { mastraClient } from "~/packages/server/clients/mastra";
import z from "zod";
import { type DashRuntimeContext } from "~/packages/ai/src/mastra/agents";
import { getCommunityFromServer } from "~/packages/server/queries/communities";
import { getUser } from "~/packages/server/queries/getUser";
import { createUser } from "~/packages/server/mutations/createUser";
import { createCommunity } from "~/packages/server/mutations/createCommunity";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

console.log("Logging in to discord...");
await client.login(env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log("Discord client ready");
});

client.on("guildCreate", async (guild) => {
    const owner = await guild.fetchOwner();

    let user = await getUser({
        identifier: owner.id,
        platform: "discord",
    });

    if (!user) {
        user = await createUser({
            platform: "discord",
            subject: owner.id,
            username: owner.user.username,
            name: owner.displayName,
            image: owner.displayAvatarURL(),
        });
    }

    let community = await getCommunityFromServer({
        guild: guild.id,
    });

    if (user.communities.length === 0 && !community) {
        community = await createCommunity({
            platform: "discord",
            connection: "server",
            name: guild.name,
            image: guild.iconURL() ?? "",
            user: user.id,
            config: {
                guild: guild.id,
            },
        });
    }

    if (user.communities.length > 0) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('community-select')
            .setPlaceholder('Select a community')
            .addOptions([
                ...user.communities.map((community) => ({
                    label: community.community.name,
                    value: community.community.id,
                })),
                {
                    label: 'Create a new community',
                    value: 'new',
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        return owner.send({
            content: `Let's get you setup, please select which community you want to use with ${guild.name}`,
            components: [row.toJSON()],
        });
    }
});

// TODO: Error handling
client.on("messageCreate", async (message) => {
    if (message.author.bot || !client.user) return;

    const mentioned = message.mentions.has(client.user.id);
    if (!mentioned) return;

    await message.channel.sendTyping();

    const mentions = message.mentions.users
        .filter((user) => user.id !== client.user?.id)

    const room = message.channel.isDMBased() ? `dm:${message.author.id}` : `channel:${message.channel.id}`;
    const embeds: string[] = [];


    const community = await getCommunityFromServer({
        guild: message.guild?.id ?? "",
    });

    if (!community) {
        return message.reply("Community not found, please reach out to the server owner to finish setting up Dash.");
    }

    let user = await getUser({
        identifier: message.author.id,
        platform: "discord",
    });

    if (!user) {
        user = await createUser({
            platform: "discord",
            subject: message.author.id,
            username: message.author.username,
            name: message.author.displayName,
            image: message.author.displayAvatarURL(),
        });
    }

    const agent = mastraClient.getAgent("dash");

    // TODO: Add mentions to runtime context
    const runtimeContext: DashRuntimeContext = {
        platform: "discord",
        room,
        community,
        user,
    }

    const response = await agent.generate({
        messages: [
            {
                role: "user",
                content: message.content,
            }
        ],
        output: z.object({
            text: z.string().describe("The text response to the user's message"),
            // components: z.array(z.object({
            //     // TODO: Discord components
            // })).describe("Any special components with the text response"),
        }),
        runtimeContext,
        headers: {
            "Authorization": `Bearer ${env.AGENT_TOKEN}`
        },
        resourceId: user.id,
    });

    message.reply(response.object.text);
});