import { ActionRowBuilder, Client, StringSelectMenuBuilder, type Interaction } from "discord.js";
import { env } from "~/env";
import { mastraClient } from "~/packages/server/clients/mastra";
import z from "zod";
import { type DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { getCommunityFromServer } from "~/packages/server/queries/getCommunityFromServer";
import { getUser, type User } from "~/packages/server/queries/getUser";
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
import { createTool } from "@mastra/core";
import { db } from "~/packages/db";
import { passes, points, xp } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";
import { getPrediction } from "~/packages/server/queries/getPrediction";
import { channelSnapshot } from "./tools/channelSnapshot";
import { getRaffles } from "~/packages/server/tools/getRaffles";
import { getRounds } from "~/packages/server/tools/getRounds";
import { getProducts } from "~/packages/server/tools/getProducts";
import { RaffleEmbed } from "./embeds/raffle";
import { RoundEmbed } from "./embeds/round";
import { ProductEmbed } from "./embeds/product";
import type { Community } from "~/packages/server/mutations/createCommunity";
import { checkQuest } from "~/packages/server/mutations/checkQuest";

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

        // const embeds: string[] = []; add to runtimeContext

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

        const agent = mastraClient.getAgent("dash");

        const runtimeContext = new RuntimeContext<DashRuntimeContext>();

        runtimeContext.set("platform", "discord");
        runtimeContext.set("room", room);
        runtimeContext.set("community", community);
        runtimeContext.set("user", user);
        runtimeContext.set("mentions", mentionedAccounts);

        const response = await agent.generate({
            messages: [
                {
                    role: "user",
                    content: message.content,
                },
            ],
            clientTools: {
                channelSnapshot: channelSnapshot(message),
            },
            runtimeContext,
            experimental_output: z
                .object({
                    text: z.string().describe("The text response to the user's message"),
                    embeds: z
                        .array(
                            z.union([
                                z.object({
                                    type: z.literal("quest"),
                                    quest: getQuests.outputSchema.element.describe(
                                        "Quests returned from the getQuests tool call",
                                    ),
                                }),
                                z.object({
                                    type: z.literal("prediction"),
                                    prediction: getPredictions.outputSchema.element.describe(
                                        "Predictions returned from the getPredictions tool call",
                                    ),
                                }),
                                z.object({
                                    type: z.literal("event"),
                                    event: getEvents.outputSchema.element.describe(
                                        "Events returned from the getEvents tool call",
                                    ),
                                }),
                                z.object({
                                    type: z.literal("raffle"),
                                    raffle: getRaffles.outputSchema.element.describe(
                                        "Raffles returned from the getRaffles tool call",
                                    ),
                                }),
                                z.object({
                                    type: z.literal("round"),
                                    round: getRounds.outputSchema.element.describe(
                                        "Rounds returned from the getRounds tool call",
                                    ),
                                }),
                                z.object({
                                    type: z.literal("product"),
                                    product: getProducts.outputSchema.element.describe(
                                        "Products returned from the getProducts tool call",
                                    ),
                                }),
                            ]),
                        )
                        .max(3)
                        .describe("An array of embeds if requested / relevant to this response"),
                })
                .required({
                    text: true,
                    embeds: true,
                }),
            memory: {
                thread: {
                    id: randomUUID(),
                    resourceId: user.id,
                    metadata: {
                        platform: "discord",
                        room,
                        community,
                        user,
                        mentions: mentionedAccounts,
                    },
                },
                resource: user.id,
            },
        });

        const messages: Array<{
            components: Array<ReturnType<typeof Row>>;
            embeds: Array<ReturnType<typeof Embed>>;
        }> = [];

        for (const embed of response.object.embeds) {
            if (embed.type === "quest") {
                const quest = QuestEmbed({ quest: embed.quest });

                messages.push({
                    components: quest.components,
                    embeds: [quest.embed],
                });
            }

            if (embed.type === "prediction") {
                const prediction = PredictionEmbed({ prediction: embed.prediction });

                messages.push({
                    components: prediction.components,
                    embeds: [prediction.embed],
                });
            }

            if (embed.type === "event") {
                const event = EventEmbed({ event: embed.event });

                messages.push({
                    components: event.components,
                    embeds: [event.embed],
                });
            }

            if (embed.type === "raffle") {
                const raffle = RaffleEmbed({ raffle: embed.raffle });

                messages.push({
                    components: raffle.components,
                    embeds: [raffle.embed],
                });
            }

            if (embed.type === "round") {
                const round = RoundEmbed({ round: embed.round });

                messages.push({
                    components: round.components,
                    embeds: [round.embed],
                });
            }

            if (embed.type === "product") {
                const product = ProductEmbed({ product: embed.product });

                messages.push({
                    components: product.components,
                    embeds: [product.embed],
                });
            }
        }

        const [replyMessage, ...additionalMessages] = messages;

        await message.reply({
            content: response.object.text,
            components: replyMessage.components.map((component) => component.toJSON()),
            embeds: replyMessage.embeds.map((embed) => embed.toJSON()),
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
