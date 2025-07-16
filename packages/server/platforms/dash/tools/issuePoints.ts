import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { sql } from "drizzle-orm";
import { escrows, passes, points } from "~/packages/db/schema/public";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";

export const issuePoints = createTool({
    id: "issuePoints",
    description: "Create/issue new points to the user",
    inputSchema: z.object({
        amount: z.number().describe("The number of points to issue"),
    }),
    outputSchema: z.boolean().describe("Whether the points were issued successfully"),
    execute: async ({ context, runtimeContext }) => {
        await db.primary.transaction(async (tx) => {
            const user = runtimeContext.get("user") as DashRuntimeContext["user"];
            const community = runtimeContext.get("community") as DashRuntimeContext["community"];

            if (!community) {
                throw new Error("Community is required to tip points");
            }

            const isOwner = community.admins.some((admin) => admin.user === user.id && admin.owner);

            if (!isOwner) {
                throw new Error("You must be the owner of the community to issue points");
            }

            await tx
                .insert(passes)
                .values({
                    user: user.id,
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
                to: user.id,
                amount: context.amount,
            });
        });

        return true;
    },
});
