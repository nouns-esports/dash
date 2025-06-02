import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { and, eq, or } from "drizzle-orm";
import { passes } from "~/packages/db/schema/public";

export const fetchPass = createTool({
    id: "internal:fetchPass",
    description: "Fetch a user's pass (xp & points info for a community) from the database using the user id or account id",
    inputSchema: z.object({
        community: z.string().describe("The community id to fetch the pass for"),
        user: z.string().optional().describe("The optional user id to fetch the pass for"),
        account: z.string().optional().describe("The optional account id to fetch the pass for"),
    }),
    execute: async ({ context }) => {
        return db.pgpool.query.passes.findFirst({
            where: and(
                or(
                    context.user ? eq(passes.user, context.user) : undefined,
                    context.account ? eq(passes.account, context.account) : undefined
                ),
                eq(passes.community, context.community)
            )
        })
    }
})

