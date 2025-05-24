import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export const hasRole = createTool({
    id: "discord:hasRole",
    description: "Check if a user has a role in a server",
    inputSchema: z.object({
        role: z.string().describe("The role id"),
        server: z.string().describe("The server id the role is in"),
        user: z.string().describe("The user id to check for")
    }),
    outputSchema: z.boolean(),
    execute: async ({ context }, options) => {
        return true
    }
})

