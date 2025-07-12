import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { db } from "~/packages/db";
import { bets, predictions } from "~/packages/db/schema/public";
import { and, cosineDistance, desc, eq, lt } from "drizzle-orm";
import { env } from "~/env";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const getPredictions = createTool({
    id: "getPredictions",
    description: "Get predictions for a community or event",
    inputSchema: z.object({
        community: z.string().describe("The id of the community"),
        event: z.string().optional().describe("The id of the event"),
        limit: z
            .number()
            .max(3)
            .optional()
            .describe("The number of predictions to get with a max of 3"),
        search: z.string().optional().describe("A search term or phrase to filter predictions by"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the prediction"),
            name: z.string().describe("The name of the prediction"),
            rules: z.string().describe("The rules of the prediction"),
            image: z.string().describe("The image of the prediction"),
            xp: z.number().describe("The xp earned for predicting the right outcome"),
            pool: z.number().describe("Amount of points pooled in total on this prediction"),
            closed: z.boolean().describe("Whether the prediction is closed for new predictions"),
            resolved: z.boolean().describe("Whether the prediction has been finalized"),
            outcomes: z.array(
                z.object({
                    id: z.string().describe("The id of the outcome"),
                    name: z.string().describe("The name of the outcome"),
                    pool: z.number().describe("Amount of points pooled on this outcome"),
                    odds: z.number().describe("The % odds of this outcome will happen"),
                    result: z
                        .boolean()
                        .nullable()
                        .describe("If not null, the result of the outcome"),
                    userBet: z.boolean().describe("If the user bet on this outcome"),
                }),
            ),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get quests");
        }

        let searchEmbedding: number[] | undefined;

        if (context.search) {
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-small"),
                value: context.search,
            });

            searchEmbedding = embedding;
        }

        const fetchedPredictions = await db.pgpool.query.predictions.findMany({
            where: and(
                eq(predictions.community, community.id),
                context.event ? eq(predictions.event, context.event) : undefined,
                // searchEmbedding
                //     ? lt(cosineDistance(predictions.embedding, searchEmbedding), 0.75)
                //     : undefined,
            ),
            orderBy: searchEmbedding
                ? [cosineDistance(predictions.embedding, searchEmbedding), desc(predictions.start)]
                : desc(predictions.start),
            with: {
                outcomes: {
                    with: {
                        bets: {
                            where: eq(bets.user, user.id),
                            limit: 1,
                        },
                    },
                },
            },
            limit: context.limit ?? 3,
        });

        return fetchedPredictions.map((prediction) => ({
            id: prediction.id,
            name: prediction.name,
            rules: prediction.rules,
            image: `${env.NEXT_PUBLIC_DOMAIN}/api/images/predictions?prediction=${prediction.id}`,
            xp: prediction.xp,
            pool: prediction.pool,
            closed: prediction.closed,
            resolved: prediction.resolved,
            outcomes: prediction.outcomes.map((outcome) => ({
                id: outcome.id,
                name: outcome.name,
                pool: outcome.pool,
                odds: (outcome.pool / prediction.pool) * 100,
                result: outcome.result,
                userBet: outcome.bets.length > 0,
            })),
        }));
    },
});
