import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { db } from "~/packages/db";
import { products } from "~/packages/db/schema/public";
import { and, cosineDistance, eq, lt } from "drizzle-orm";
import { parseProduct } from "~/packages/server/utils/parseProduct";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { CustomError } from "~/packages/server/utils/tryCatch";

export const getProducts = createTool({
    id: "getProducts",
    description: "Get product(s) for a community",
    inputSchema: z.object({
        community: z.string().describe("The id of the community"),
        event: z.string().optional().describe("The id of the event"),
        limit: z
            .number()
            .max(3)
            .optional()
            .describe("The number of products to get with a max of 3"),
        search: z.string().optional().describe("A search term or phrase to filter products by"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the product"),
            name: z.string().describe("The name of the product"),
            image: z.string().describe("The image of the product"),
            price: z.number().describe("The starting at price of the product"),
            inventory: z.number().nullable().describe("The remaining stock of the product"),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new CustomError({
                name: "COMMUNITY_REQUIRED",
                message: "Community is required to get products",
            });
        }

        let searchEmbedding: number[] | undefined;

        if (context.search) {
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-small"),
                value: context.search,
            });

            searchEmbedding = embedding;
        }

        const fetchedProducts = await db.pgpool.query.products.findMany({
            where: and(
                eq(products.community, community.id),
                context.event ? eq(products.event, context.event) : undefined,
                // searchEmbedding
                //     ? lt(cosineDistance(products.embedding, searchEmbedding), 0.75)
                //     : undefined,
                eq(products.active, true),
            ),
            orderBy: searchEmbedding
                ? cosineDistance(products.embedding, searchEmbedding)
                : undefined,
            limit: context.limit ?? 3,
            with: {
                variants: true,
            },
        });

        return fetchedProducts.map((product) => {
            const price = Math.min(...product.variants.map((variant) => variant.price));

            let inventory: number | null = 0;

            for (const variant of product.variants) {
                if (variant.inventory === null) {
                    inventory = null;
                    break;
                }

                inventory += variant.inventory;
            }

            const { images } = parseProduct({
                product,
            });

            return {
                id: product.id,
                name: product.name,
                image: images[0],
                price,
                inventory,
            };
        });
    },
});
