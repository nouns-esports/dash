import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { and, eq, sql } from "drizzle-orm";
import { passes, points } from "~/packages/db/schema/public";

export const tipPoints = createTool({
    id: "internal:tipPoints",
    description: "Tip points to another user",
    inputSchema: z.object({
        amount: z.number().describe("The number of points to tip"),
    }),
    outputSchema: z.boolean().describe("Whether the points were tipped successfully"),
    execute: async ({ context, runtimeContext }) => {
        await db.primary.transaction(async (tx) => {
            const user = runtimeContext.get("user") as any;
            const community = runtimeContext.get("community") as any;
            const mentions = runtimeContext.get("mentions") as any;

            if (mentions.length === 0) {
                throw new Error("You must mention a user to tip points to");
            }

            if (!community.id) {
                throw new Error("Community not found, please specify a community id");
            }

            const pass = await tx.query.passes.findFirst({
                where: and(eq(passes.user, user.id), eq(passes.community, community.id))
            })

            if (!pass?.user) {
                return false
            }

            await tx
                .update(passes)
                .set({
                    points: sql`${passes.points} - ${context.amount}`,
                })
                .where(eq(passes.id, pass.id));

            await tx
                .update(passes)
                .set({
                    points: sql`${passes.points} + ${context.amount}`,
                })
                .where(eq(passes.id, pass.id));

            await tx.insert(points).values({
                community: community.id,
                from: pass.id,
                to: user.id,
                amount: context.amount,
                timestamp: new Date(),
            });
        });

        return true
    }
})

