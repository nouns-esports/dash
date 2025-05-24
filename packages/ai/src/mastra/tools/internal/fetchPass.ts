import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { and, eq } from "drizzle-orm";
import { passes } from "~/packages/db/schema/public";

export const fetchPass = createTool({
    id: "internal:fetchPass",
    description: "Fetch a pass (xp & points info) from the database",
    inputSchema: z.object({
        user: z.string().describe("The user id to fetch the pass for"),
        community: z.string().describe("The community id to fetch the pass for")
    }),
    execute: async ({ context }, options) => {
        const pass = await db.pgpool.query.passes.findFirst({
            where: and(eq(passes.user, context.user), eq(passes.community, context.community))
        })

        return pass
    }
})

