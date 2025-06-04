import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { and, eq } from "drizzle-orm";
import { passes } from "~/packages/db/schema/public";

export const fetchPass = createTool({
    id: "internal:fetchPass",
    description: "Fetch a user's pass (xp & points info for a community) from the database using the user id",
    inputSchema: z.object({
        community: z.string().describe("The community id to fetch the pass for"),
        user: z.string().describe("The user id to fetch the pass for"),
    }),
    execute: async ({ context }) => {
        return db.pgpool.query.passes.findFirst({
            where: and(
                eq(passes.user, context.user),
                eq(passes.community, context.community)
            )
        })
    }
})

