import { db } from "~/packages/db";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { raffleEntries, raffles } from "~/packages/db/schema/public";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "../../agent/src/mastra/agents";

export const getRaffles = createTool({
    id: "getRaffles",
    description: "Get raffle(s) for a community",
    inputSchema: z.object({
        entries: z
            .number()
            .optional()
            .describe("The number of times the user has entered the raffle"),
        limit: z
            .number()
            .max(3)
            .optional()
            .describe("The number of raffles to get with a max of 3"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the raffle"),
            name: z.string().describe("The name of the raffle"),
            image: z.string().describe("The image of the raffle"),
            cost: z.number().describe("The cost to enter the raffle"),
            winners: z.number().describe("The number of winners for the raffle"),
            userEntries: z.number().describe("The number of entries the user has for the raffle"),
            totalEntries: z.number().describe("The total number of entries for the raffle"),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get quests");
        }

        const fetchedRaffles = await db.pgpool.query.raffles.findMany({
            where: and(eq(raffles.community, community.id)),
            orderBy: desc(raffles.start),
            with: {
                community: true,
                entries: {
                    where: eq(raffleEntries.user, user.id),
                },
            },
            limit: context.limit ?? 3,
            extras: {
                totalEntries:
                    sql<number>`(SELECT COALESCE(SUM(raffle_entries.amount), 0) FROM raffle_entries WHERE raffle_entries.raffle = raffles.id)`.as(
                        "totalEntries",
                    ),
            },
        });

        return fetchedRaffles.map((raffle) => ({
            id: raffle.id,
            name: raffle.name,
            description: raffle.description,
            image: raffle.images[0],
            cost: raffle.gold,
            winners: raffle.winners,
            userEntries: raffle.entries.reduce((acc, entry) => acc + entry.amount, 0),
            totalEntries: raffle.totalEntries,
        }));
    },
});
