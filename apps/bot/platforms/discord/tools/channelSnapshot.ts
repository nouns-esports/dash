import { z } from "zod";
import { createTool } from "@mastra/core";
import { db } from "~/packages/db";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import type { Message } from "discord.js";
import { getMentionedAccounts } from "~/packages/server/queries/getMentionedAccounts";
import { createAccounts } from "~/packages/server/mutations/createAccounts";

export function channelSnapshot(message: Message) {
    return createTool({
        id: "discord:channelSnapshot",
        description: "Take a snapshot of members in the channel and distribute xp and/or points",
        inputSchema: z.object({
            reason: z.string().optional().describe("The reason for the snapshot"),
            xp: z.number().describe("The amount of xp to distribute"),
            points: z.number().describe("The amount of points to distribute"),
        }),
        outputSchema: z.boolean().describe("Whether the snapshot was taken successfully"),
        execute: async ({ context, runtimeContext }) => {
            await db.primary.transaction(async (tx) => {
                const user = runtimeContext.get("user") as DashRuntimeContext["user"];
                const community = runtimeContext.get(
                    "community",
                ) as DashRuntimeContext["community"];

                if (!community) {
                    throw new Error("Community is required to take Discord channel snapshots");
                }

                if (!user.admin || !community.admins.find((admin) => admin.user === user.id)) {
                    throw new Error("You are not authorized to take xp snapshots");
                }

                if (!message.channel.isVoiceBased()) {
                    throw new Error("I can only take xp snapshots from voice channels");
                }

                if (context.xp === 0 && context.points === 0) {
                    throw new Error("You must distribute at least 1 xp or 1 point to each user");
                }

                const members = message.channel.members.map((guildMember) => guildMember.user.id);

                if (members.length === 0) {
                    throw new Error("Nobody is in the channel");
                }

                let channelAccounts = await getMentionedAccounts({
                    identifiers: members,
                    platform: "discord",
                });

                const missingChannelAccounts = members.filter(
                    (member) => !channelAccounts.find((account) => account.identifier === member),
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
    });
}
