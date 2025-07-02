import { ActionRowBuilder, Client, StringSelectMenuBuilder } from "discord.js";
import { env } from "~/env";
import { mastraClient } from "~/packages/server/clients/mastra";
import z from "zod";
import { type DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { getCommunityFromServer } from "~/packages/server/queries/getCommunityFromServer";
import { getUser } from "~/packages/server/queries/getUser";
import { createUser } from "~/packages/server/mutations/createUser";
import { createHash } from "crypto";
import { getMentionedAccounts } from "~/packages/server/queries/getMentionedAccounts";
import { createAccounts } from "~/packages/server/mutations/createAccounts";
import { randomUUID } from "crypto";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { Row } from "./components/row";
import { Button } from "./components/button";
import { Select } from "./components/select";
import type { Embed } from "./components/embed";
import { QuestEmbed } from "./embeds/quest";
import { PredictionEmbed } from "./embeds/prediction";
import { getQuests } from "~/packages/server/tools/getQuests";
import { getPredictions } from "~/packages/server/tools/getPredictions";
import { Input, Modal } from "./components/modal";
import { getEvents } from "~/packages/server/tools/getEvents";
import { EventEmbed } from "./embeds/event";
import { checkQuest } from "~/packages/server/mutations/checkQuest";
import { createTool } from "@mastra/core";
import { db } from "~/packages/db";
import { passes, points, xp } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";
import { getPrediction } from "~/packages/server/queries/getPrediction";

// import { createCommunity } from "~/packages/server/mutations/createCommunity";
// import { getCommunity } from "~/packages/server/queries/getCommunity";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
});

console.log("Logging in to discord...");
await client.login(env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log("Discord client ready");
});

// client.on("guildCreate", async (guild) => {
//     const owner = await guild.fetchOwner();

//     let user = await getUser({
//         identifier: owner.id,
//         platform: "discord",
//     });

//     if (!user) {
//         user = await createUser({
//             platform: "discord",
//             subject: owner.id,
//             username: owner.user.username,
//             name: owner.displayName,
//             image: owner.displayAvatarURL(),
//         });
//     }

//     let community = await getCommunityFromServer({
//         guild: guild.id,
//     });

//     if (user.communities.length === 0 && !community) {
//         community = await createCommunity({
//             platform: "discord",
//             connection: "server",
//             name: guild.name,
//             image: guild.iconURL() ?? "",
//             user: user.id,
//             config: {
//                 guild: guild.id,
//             },
//         });
//     }

//     if (user.communities.length > 0) {
//         const selectMenu = new StringSelectMenuBuilder()
//             .setCustomId(`select-community:${guild.id}`)
//             .setPlaceholder('Select a community')
//             .addOptions([
//                 ...user.communities.map((community) => ({
//                     label: community.community.name,
//                     value: community.community.id,
//                 })),
//                 {
//                     label: 'Create a new community',
//                     value: 'new',
//                 }
//             ]);

//         const row = new ActionRowBuilder().addComponents(selectMenu);

//         return owner.send({
//             content: `Let's get you setup, please select which community you want to use with ${guild.name}`,
//             components: [row.toJSON()],
//         });
//     }
// });

// client.on("interactionCreate", async (interaction) => {
// if (interaction.isStringSelectMenu() && interaction.id.startsWith("community-select")) {
//     await interaction.deferReply();

//     const selectedCommunity = interaction.values[0];
//     const [_, userId, guildId] = interaction.id.split(":");

//     const guild = await client.guilds.fetch(guildId);

//     if (selectedCommunity === "new") {
//         await createCommunity({
//             platform: "discord",
//             connection: "server",
//             name: guild.name,
//             image: guild.iconURL() ?? "",
//             user: userId,
//             config: {
//                 guild: guildId,
//             },
//         })
//     }

//     else {
//         await getCommunity({
//             id: selectedCommunity,
//         });
//     }

//     await interaction.reply({
//         content: `Successfully linked ${guild.name}`,
//     })
// }
// });

client.on("interactionCreate", async (interaction) => {
    const type = interaction.id.split(":")[0];

    if (!interaction.guild) {
        if ("reply" in interaction) {
            return interaction.reply({
                ephemeral: true,
                content: "Sorry, I can only interact in servers right now.",
            });
        }

        return;
    }

    const community = await getCommunityFromServer({
        server: interaction.guild.id,
    });

    if (!community) {
        if ("reply" in interaction) {
            return interaction.reply({
                ephemeral: true,
                content:
                    "Community not found, please reach out to the server owner to finish setting up Dash.",
            });
        }

        return;
    }

    let user = await getUser({
        identifier: interaction.user.id,
        platform: "discord",
    });

    if (!user) {
        user = await createUser({
            platform: "discord",
            subject: interaction.user.id,
            username: interaction.user.username,
            name: interaction.user.displayName,
            image: interaction.user.displayAvatarURL(),
        });
    }

    if (type === "quest") {
        const id = interaction.id.split(":")[1];
        const action = interaction.id.split(":")[2];

        if (interaction.isButton() && action === "check") {
            const result = await checkQuest({
                user: user.id,
                quest: id,
            });

            await interaction.reply({
                content: {
                    claimed: `Quest claimed! You've earned ${result.xp}xp!`,
                    "already-completed": "Looks like you already completed this quest!",
                    "not-completed":
                        "Doesn't look like you've completed all the actions for this quest yet.",
                }[result.state],
            });
        }
    }

    if (type === "prediction") {
        const id = interaction.id.split(":")[1];
        const action = interaction.id.split(":")[2];

        const prediction = await getPrediction({
            id,
            user: user.id,
        });

        if (!prediction) {
            if ("reply" in interaction) {
                return interaction.reply({
                    content: "Prediction not found",
                    ephemeral: true,
                });
            }

            return;
        }

        if (interaction.isStringSelectMenu() && action === `prediction:${prediction.id}:predict`) {
            const selectedOutcome = interaction.values[0];

            const outcome = prediction.outcomes.find((outcome) => outcome.id === selectedOutcome);

            if (!outcome) {
                return interaction.reply({
                    content: "Outcome not found",
                    ephemeral: true,
                });
            }

            await interaction.reply({
                content: `Successfully placed your prediction for ${outcome.name}`,
            });
        }

        if (interaction.isButton() && action === "predict") {
            await interaction.reply({
                content: "Choose an outcome for your prediction",
                ephemeral: true,
                components: [
                    Row([
                        Select({
                            customId: `prediction:${prediction.id}:predict`,
                            placeholder: "Select outcome",
                            maxValues: 1,
                            options: prediction.outcomes.map((outcome) => ({
                                label: outcome.name,
                                value: outcome.id,
                            })),
                        }),
                    ]).toJSON(),
                ],
            });
        }
    }
});

client.on("messageCreate", async (message) => {
    try {
        if (message.author.bot || !client.user) return;

        const mentioned = message.mentions.has(client.user.id);
        if (!mentioned) return;

        console.log("Message:", {
            author: message.author.username,
            message: message.content,
            channel: message.channel.id,
            guild: message.guild?.id ?? null,
        });

        await message.channel.sendTyping();

        const mentions = Array.from(message.mentions.users.values()).filter(
            (user) => user.id !== client.user?.id,
        );

        const room = message.channel.isDMBased()
            ? `dm:${message.author.id}`
            : `channel:${message.channel.id}`;
        // const embeds: string[] = [];

        if (!message.guild?.id) {
            return message.reply("Sorry, I can only chat in servers right now.");
        }

        const community = await getCommunityFromServer({
            server: message.guild.id,
        });

        if (!community) {
            return message.reply(
                "Community not found, please reach out to the server owner to finish setting up Dash.",
            );
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

        let mentionedAccounts = await getMentionedAccounts({
            identifiers: mentions.map((mention) => mention.id),
            platform: "discord",
        });

        const missingAccounts = mentions.filter(
            (mention) => !mentionedAccounts.find((account) => account.identifier === mention.id),
        );

        if (missingAccounts.length > 0) {
            mentionedAccounts = await createAccounts({
                identifiers: missingAccounts.map((mention) => mention.id),
                platform: "discord",
            });
        }

        const runtimeContext: DashRuntimeContext = {
            platform: "discord",
            room,
            community,
            user,
            mentions: mentionedAccounts,
        };

        const agent = mastraClient(runtimeContext).getAgent("dash");

        // const runtimeContext = new RuntimeContext<DashRuntimeContext>()

        // runtimeContext.set("platform", "discord");
        // runtimeContext.set("room", room);
        // runtimeContext.set("community", community);
        // runtimeContext.set("user", user);
        // runtimeContext.set("mentions", mentionedAccounts);

        const response = await agent.generate({
            messages: [
                {
                    role: "user",
                    content: message.content,
                },
            ],
            clientTools: {
                channelSnapshot: createTool({
                    id: "discord:channelSnapshot",
                    description:
                        "Take a snapshot of members in the channel and distribute xp and/or points",
                    inputSchema: z.object({
                        reason: z.string().optional().describe("The reason for the snapshot"),
                        xp: z.number().describe("The amount of xp to distribute"),
                        points: z.number().describe("The amount of points to distribute"),
                    }),
                    outputSchema: z
                        .boolean()
                        .describe("Whether the snapshot was taken successfully"),
                    execute: async ({ context, runtimeContext }) => {
                        await db.primary.transaction(async (tx) => {
                            const user = runtimeContext.get("user") as DashRuntimeContext["user"];
                            const community = runtimeContext.get(
                                "community",
                            ) as DashRuntimeContext["community"];

                            if (!community) {
                                throw new Error(
                                    "Community is required to take Discord channel snapshots",
                                );
                            }

                            if (
                                !user.admin ||
                                !community.admins.find((admin) => admin.user === user.id)
                            ) {
                                throw new Error("You are not authorized to take xp snapshots");
                            }

                            if (!message.channel.isVoiceBased()) {
                                throw new Error("I can only take xp snapshots from voice channels");
                            }

                            if (context.xp === 0 && context.points === 0) {
                                throw new Error(
                                    "You must distribute at least 1 xp or 1 point to each user",
                                );
                            }

                            const members = message.channel.members.map(
                                (guildMember) => guildMember.user.id,
                            );

                            if (members.length === 0) {
                                throw new Error("Nobody is in the channel");
                            }

                            let channelAccounts = await getMentionedAccounts({
                                identifiers: members,
                                platform: "discord",
                            });

                            const missingChannelAccounts = members.filter(
                                (member) =>
                                    !channelAccounts.find(
                                        (account) => account.identifier === member,
                                    ),
                            );

                            if (missingChannelAccounts.length > 0) {
                                channelAccounts = await createAccounts({
                                    identifiers: missingChannelAccounts,
                                    platform: "discord",
                                });
                            }

                            console.log("SNAPSHOT");
                            console.log("channelAccounts", channelAccounts);
                            console.log("context", context);

                            // for (const account of channelAccounts) {
                            // if (account.user) {
                            //     if (context.xp) {
                            //         // await tx.insert(xp).values({
                            //         //     user: account.user?.id ?? null,
                            //         //     amount: context.xp,
                            //         //     community: community.id,
                            //         // });
                            //     }
                            //     await tx
                            //         .insert(passes)
                            //         .values({
                            //             user: user.id,
                            //             xp: context.xp,
                            //             points: context.points,
                            //             community: community.id,
                            //         })
                            //         .onConflictDoUpdate({
                            //             target: [passes.user, passes.community],
                            //             set: {
                            //                 xp: sql`${passes.xp} + ${context.xp}`,
                            //                 points: sql`${passes.points} + ${context.points}`,
                            //             },
                            //         });
                            // } else {
                            //     await tx.insert(xp).values({
                            //         user: account.id,
                            //         amount: context.xp,
                            //         community: community.id,
                            //     });
                            //     await tx.insert(points).values({
                            //         to: account.id,
                            //         amount: context.points,
                            //         community: community.id,
                            //     });
                            // }
                            // }
                        });

                        return true;
                    },
                }),
            },

            experimental_output: z
                .object({
                    text: z.string().describe("The text response to the user's message"),
                    quests: getQuests.outputSchema.describe(
                        "An array of quests if requested / relevant to this response from the getQuests tool call",
                    ),
                    predictions: getPredictions.outputSchema.describe(
                        "An array of predictions if requested / relevant to this response from the getPredictions tool call",
                    ),
                    events: getEvents.outputSchema.describe(
                        "An array of events if requested / relevant to this response from the getEvents tool call",
                    ),
                })
                .required({
                    text: true,
                    quests: true,
                    predictions: true,
                }),
            memory: {
                thread: {
                    id: randomUUID(),
                    resourceId: user.id,
                    metadata: runtimeContext,
                },
                resource: user.id,
            },
        });

        // TODO: Standardize quest responses with embeds concept making a quest a single embed type like url, image, or video
        // TODO: Parse the user prompt embeds for nouns.gg or dash urls that might contain embeds like quests or predictions and auto converted into their respective components
        const components: Array<ReturnType<typeof Row>> = [];
        const embeds: Array<ReturnType<typeof Embed>> = [];

        const additionalMessages: Array<{
            components: Array<ReturnType<typeof Row>>;
            embeds: Array<ReturnType<typeof Embed>>;
        }> = [];

        for (let i = 0; i < response.object.quests.length; i++) {
            const quest = response.object.quests[i];

            const component = Row([
                Button({
                    label: "Check",
                    type: "primary",
                    disabled: true,
                    customId: `quest:${quest.id}:check`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/quests/${quest.id}`,
                }),
            ]);

            const embed = QuestEmbed({ quest });

            if (i === 0) {
                embeds.push(embed);
                components.push(component);
                continue;
            }

            additionalMessages.push({
                components: [component],
                embeds: [embed],
            });
        }

        for (let i = 0; i < response.object.predictions.length; i++) {
            const prediction = response.object.predictions[i];

            const component = Row([
                Button({
                    label: "Predict",
                    type: "primary",
                    disabled: true,
                    customId: `prediction:${prediction.id}:predict`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/predictions/${prediction.id}`,
                }),
            ]);

            const embed = PredictionEmbed({ prediction });

            if (i === 0) {
                embeds.push(embed);
                components.push(component);
                continue;
            }

            additionalMessages.push({
                components: [component],
                embeds: [embed],
            });
        }

        for (let i = 0; i < response.object.events.length; i++) {
            const event = response.object.events[i];

            const component = Row([
                Button({
                    label: "Register",
                    type: "primary",
                    disabled: true,
                    customId: `event:${event.id}:register`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/events/${event.id}`,
                }),
            ]);

            const embed = EventEmbed({ event });

            if (i === 0) {
                embeds.push(embed);
                components.push(component);
                continue;
            }

            additionalMessages.push({
                components: [component],
                embeds: [embed],
            });
        }

        await message.reply({
            content: response.object.text,
            components: components.map((component) => component.toJSON()),
            embeds: embeds.map((embed) => embed.toJSON()),
        });

        for (const additionalMessage of additionalMessages) {
            await message.channel.send({
                components: additionalMessage.components.map((component) => component.toJSON()),
                embeds: additionalMessage.embeds.map((embed) => embed.toJSON()),
            });
        }
    } catch (error) {
        const digest = createHash("sha256").update(JSON.stringify(error)).digest("hex");
        console.error(`Error: ${digest}`, error);
        message.reply(`Sorry, something went wrong.\n\n${digest}`);
    }
});
