import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { sql } from "drizzle-orm";
import { escrows, passes, points } from "~/packages/db/schema/public";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";

export const tipPoints = createTool({
    id: "tipPoints",
    description: "Send/tip/give points to another user in the same community",
    inputSchema: z.object({
        amount: z.number().describe("The number of points to tip"),
    }),
    outputSchema: z.boolean().describe("Whether the points were sent successfully"),
    execute: async ({ context, runtimeContext }) => {
        await db.primary.transaction(async (tx) => {
            const user = runtimeContext.get("user") as DashRuntimeContext["user"];
            const community = runtimeContext.get("community") as DashRuntimeContext["community"];
            const mentions = runtimeContext.get("mentions") as DashRuntimeContext["mentions"];

            const mention = mentions[0];

            if (!mention) {
                throw new Error("You must mention a user to tip points to");
            }

            if (!community) {
                throw new Error("Community is required to tip points");
            }

            const pass = user.passes.find((pass) => pass.community.id === community.id);

            if (!pass) {
                throw new Error("You do not have any points to tip");
            }

            await tx
                .insert(passes)
                .values({
                    user: user.id,
                    community: community.id,
                })
                .onConflictDoUpdate({
                    target: [passes.user, passes.community],
                    set: {
                        points: sql`${passes.points} - ${context.amount}`,
                    },
                });

            if (mention.user) {
                await tx
                    .insert(passes)
                    .values({
                        user: mention.user.id,
                        community: community.id,
                        points: context.amount,
                    })
                    .onConflictDoUpdate({
                        target: [passes.user, passes.community],
                        set: {
                            points: sql`${passes.points} + ${context.amount}`,
                        },
                    });

                await tx.insert(points).values({
                    community: community.id,
                    from: user.id,
                    to: mention.user.id,
                    amount: context.amount,
                });
            } else {
                await tx
                    .insert(escrows)
                    .values({
                        community: community.id,
                        heir: mention.id,
                        points: context.amount,
                    })
                    .onConflictDoUpdate({
                        target: [escrows.community, escrows.heir],
                        set: {
                            points: sql`${escrows.points} + ${context.amount}`,
                        },
                    });
            }
        });

        return true;
    },
});
