import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { db } from "~/packages/db";
import { attendees, events } from "~/packages/db/schema/public";
import { and, cosineDistance, desc, eq, lt, sql } from "drizzle-orm";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const getEvents = createTool({
    id: "getEvents",
    description: "Get events for a community",
    inputSchema: z.object({
        community: z.string().describe("The id of the community"),
        limit: z.number().max(3).optional().describe("The number of events to get with a max of 3"),
        search: z.string().optional().describe("A search term or phrase to filter events by"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the event"),
            name: z.string().describe("The name of the event"),
            description: z.string().describe("The description of the event"),
            image: z.string().describe("The image of the event"),
            attendeeCount: z.number().nullable().describe("The number of attendees for the event"),
            registered: z.boolean().describe("Whether the user is registered for the event"),
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

        const fetchedEvents = await db.pgpool.query.events.findMany({
            where: and(
                eq(events.community, community.id),
                searchEmbedding
                    ? lt(cosineDistance(events.embedding, searchEmbedding), 0.5)
                    : undefined,
            ),
            orderBy: searchEmbedding
                ? [cosineDistance(events.embedding, searchEmbedding), desc(events.start)]
                : desc(events.start),
            limit: context.limit ?? 3,
            with: {
                attendees: {
                    where: eq(attendees.user, user.id),
                    limit: 1,
                },
            },
        });

        return fetchedEvents.map((event) => ({
            id: event.id,
            name: event.name,
            description: event.description,
            image: event.image,
            attendeeCount: event.attendeeCount,
            registered: event.attendees.length > 0,
        }));
    },
});
