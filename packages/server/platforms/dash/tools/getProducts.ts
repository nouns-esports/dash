import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { db } from "~/packages/db";

export const getProducts = createTool({
    id: "getProducts",
    description: "Get product(s) for a community",
    inputSchema: z.object({
        limit: z
            .number()
            .max(3)
            .optional()
            .describe("The number of products to get with a max of 3"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the product"),
            name: z.string().describe("The name of the product"),
            image: z.string().describe("The image of the product"),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get products");
        }

        return [];
    },
});
