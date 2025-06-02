import { ActionRowBuilder, Client, StringSelectMenuBuilder } from "discord.js";
import { env } from "~/env";
import { db } from "~/packages/db";
import { accounts, communities, communityAdmins, communityConnections, passes, users } from "~/packages/db/schema/public";
import { and, eq, inArray } from "drizzle-orm";
import { pinataClient } from "~/packages/clients/pinata";
import { mastraClient } from "~/packages/clients/mastra";
import { privyClient } from "~/packages/clients/privy";
import z from "zod";
import { RuntimeContext } from "@mastra/core/di";
import type { DashRuntimeContext } from "~/packages/ai/src/mastra/agents";
import type { Platforms } from "~/packages/platforms";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

console.log("Logging in to discord...");
await client.login(env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log("Discord client ready");
});


// Added to a server
// 1. Identify the owner user, create account/user if not exists
// 2. DM the owner an interaction with dropdown menu to select which community to use or create a new one automatically


// On message
// 1. Check if the bot should respond
// 2. Gather context, create account/user if not exists for both the message author and mentions (mentions don't get users)
// 3. Generate response and reply

client.on("guildCreate", async (guild) => {
    try {
        const owner = await guild.fetchOwner();

        let account = await db.primary.query.accounts.findFirst({
            where: eq(accounts.identifier, owner.user.id),
            with: {
                user: {
                    with: {
                        communities: true
                    }
                }
            }
        });

        if (!account || !account.user) {
            const privyUser = await privyClient.importUser({
                linkedAccounts: [
                    {
                        type: "discord_oauth",
                        username: owner.user.username,
                        subject: owner.user.id,
                        email: null,
                    }
                ]
            })

            const avatar = owner.user.avatarURL();

            const image = avatar ? await pinataClient.upload.url(avatar) : null;


            const [user] = await db.primary.insert(users).values({
                name: owner.user.displayName,
                image: image?.IpfsHash ?? "",
                privyId: privyUser.id,
                createdAt: privyUser.createdAt,
            }).returning();

            const [discordAccount] = await db.primary.insert(accounts).values({
                identifier: owner.user.id,
                user: user.id,
                platform: "discord",
            }).returning();

            account = { ...discordAccount, user: { ...user, communities: [] } } as any;
        }

        if (account!.user!.communities.length === 0) {
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

                await tx.insert(communityConnections).values({
                    community: community.id,
                    platform: "discord",
                    type: "server",
                    config: {
                        guildId: guild.id,
                    },
                });
            });
        }

        if (account!.user!.communities.length > 1) {
            // TODO: We don't know what community the user wants to use
            // Add a dropdown (StringSelectMenu) with two options: "one" and "two"

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('community-select')
                .setPlaceholder('Select a community')
                .addOptions([
                    {
                        label: 'Create a new community',
                        value: 'create',
                    },
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return owner.send({
                content: `Let's get you setup, please select which community you want to use with ${guild.name}`,
                components: [row.toJSON()],
            });

        }

    } catch (error) {
    }
});

// Rooms are dms, channel:id

client.on("messageCreate", async (message) => {
    if (message.author.bot || !client.user) return;

    const mentioned = message.mentions.has(client.user.id);

    if (!mentioned) return;

    await message.channel.sendTyping();

    // TODO: Get communtiy from communityPlatforms.config.server, if not found, throw and error saying to reach out to the server owner to finish setting Dash up

    const mentions = message.mentions.users
        .filter((user) => user.id !== client.user?.id)


    const [account, mentionedAccounts] = await Promise.all([
        db.primary.query.accounts.findFirst({
            where: and(eq(accounts.identifier, message.author.id), eq(accounts.platform, "discord")),
            with: {
                user: true,
                pass: true,
            }
        }),
        db.primary.query.accounts.findMany({
            where: and(
                inArray(
                    accounts.identifier,
                    mentions.map((mention) => mention.id)
                ),
                eq(accounts.platform, "discord")
            ),
            with: {
                user: true,
                pass: true,
            }
        })
    ]);

    if (!account || !account.user) {
        // TODO: Create account and/or import user
    }

    const room = `channel:${message.channel.id}`;
    const embeds: string[] = [];

    const agent = mastraClient.getAgent("dash");

    const response = await agent.generate({
        messages: [
            {
                role: "user",
                content: message.content,
            }
        ],
        output: z.object({
            text: z.string().describe("The text response to the user's message"),
            embeds: z.array(z.object({
                // TODO: Discord embeds
            })).describe("Any special embeds with the text response"),
        }),
        runtimeContext: {
            platform: "discord",
        },
        headers: {
            "Authorization": `Bearer ${env.AGENT_TOKEN}`
        },
        resourceId: account?.user?.id,
        threadId: crypto.randomUUID(),
    });

    message.reply(response.object.text);
});


async function fetchAccount(input: {
    identifier: string;
    name: string;
    image: string;
    username: string;
    community: string;
    requireUser?: boolean;
}) {
    let account = await db.primary.query.accounts.findFirst({
        where: and(
            eq(accounts.identifier, input.identifier),
            eq(accounts.platform, "discord")
        ),
        with: {
            user: true,
            pass: true,
        }
    });

    if (!account) {
        // Create all three accounts, user, and pass
        let user: (typeof users.$inferSelect) | undefined;

        if (input.requireUser) {
            user = await createUser(input);
        }

        const newAccount = await createAccount({
            identifier: input.identifier,
            user: user?.id,
        });

        const pass = await createPass({
            user: user?.id,
            account: newAccount.id,
            community: input.community,
        });

        account = { ...newAccount, user: user as any ?? null, pass };

    }

    if (account && !account.user && input.requireUser) {
        // Create user
    }

    if (account && !account.pass) {
        // Create pass
    }

    return account;
}

async function createUser(input: {
    identifier: string;
    username: string;
    name: string;
    image: string;
}) {
    let privyUser = await privyClient.getUserByDiscordUsername(input.username);

    if (!privyUser) {
        privyUser = await privyClient.importUser({
            linkedAccounts: [
                {
                    type: "discord_oauth",
                    username: input.username,
                    subject: input.identifier,
                    email: null,
                }
            ]
        })
    }

    const [user] = await db.primary.insert(users).values({
        name: input.name,
        image: input.image,
        privyId: privyUser.id,
        createdAt: privyUser.createdAt,
    }).returning();

    return user;
}

async function createPass(input: {
    user?: string;
    community: string;
    account?: string;
}) {
    if (!input.user && !input.account) {
        throw new Error("Either user or account must be provided");
    }

    const [pass] = await db.primary.insert(passes).values({
        user: input.user,
        community: input.community,
        account: input.account,
    }).returning();

    return pass;
}

async function createAccount(input: {
    identifier: string;
    user?: string;
}) {
    const [account] = await db.primary.insert(accounts).values({
        identifier: input.identifier,
        platform: "discord",
        user: input.user,
    }).returning();

    return account;
}