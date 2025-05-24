import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { and, eq, sql } from "drizzle-orm";
import { passes, points } from "~/packages/db/schema/public";

export const tipPoints = createTool({
    id: "internal:tipPoints",
    description: "Tip points to another user",
    inputSchema: z.object({
        user: z.string().describe("The user id to tip points to"),
        community: z.string().describe("The community id the points are for"),
        amount: z.number().describe("The number of points to tip"),
    }),
    outputSchema: z.boolean().describe("Whether the points were tipped successfully"),
    execute: async ({ context }, options) => {
        await db.primary.transaction(async (tx) => {

            const pass = await tx.query.passes.findFirst({
                where: and(eq(passes.user, context.user), eq(passes.community, context.community))
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
                community: context.community,
                from: pass.user,
                to: context.user,
                amount: context.amount,
                timestamp: new Date(),
            });
        });

        return true
    }
})

