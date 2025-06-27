import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "../../agent/src/mastra/agents";
import { db } from "~/packages/db";
import { events } from "~/packages/db/schema/public";
import { and, desc, eq } from "drizzle-orm";

export const getEvents = createTool({
    id: "internal:getEvents",
    description: "Get events for a community",
    inputSchema: z.object({
        community: z.string().describe("The id of the community"),
        limit: z.number().max(3).optional().describe("The number of events to get with a max of 3"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the event"),
            name: z.string().describe("The name of the event"),
            description: z.string().describe("The description of the event"),
            image: z.string().describe("The image of the event"),
            attendeeCount: z.number().nullable().describe("The number of attendees for the event"),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get quests");
        }

        const fetchedEvents = await db.pgpool.query.events.findMany({
            where: and(eq(events.community, community.id)),
            orderBy: desc(events.start),
            limit: context.limit ?? 3,
        });

        return fetchedEvents.map((event) => ({
            id: event.id,
            name: event.name,
            description: event.description,
            image: event.image,
            attendeeCount: event.attendeeCount,
        }));
    },
});
