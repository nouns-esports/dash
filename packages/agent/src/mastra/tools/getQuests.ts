import { db } from "../../../../db";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { questCompletions, quests } from "../../../../db/schema/public";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "../agents";

export const getQuests = createTool({
    id: "internal:getQuests",
    description: "Get quest(s) for a community",
    inputSchema: z.object({
        completed: z.boolean().optional().describe("If the quest was completed by the user"),
        minXP: z
            .number()
            .optional()
            .describe("The optional minimum amount of xp to get quests for"),
        minPoints: z
            .number()
            .optional()
            .describe("The optional minimum amount of points to get quests for"),
        limit: z.number().max(3).optional().describe("The number of quests to get with a max of 3"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the quest"),
            name: z.string().describe("The name of the quest"),
            description: z.string().describe("The description of the quest"),
            image: z.string().describe("The image of the quest"),
            xp: z.number().describe("The amount of xp awarded for completing the quest"),
            points: z.number().describe("The amount of points awarded for completing the quest"),
            pointsLabel: z.string().describe("The community's points name"),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get quests");
        }

        const fetchedQuests = await db.pgpool.query.quests.findMany({
            where: and(
                eq(quests.community, community.id),
                context.minXP ? gte(quests.xp, context.minXP) : undefined,
                context.minPoints ? gte(quests.points, context.minPoints) : undefined,
                context.completed
                    ? sql`NOT EXISTS (SELECT 1 FROM quest_completions WHERE quest_completions.quest = quests.id AND quest_completions.user = ${user.id})`
                    : undefined,
            ),
            orderBy: desc(quests.createdAt),
            with: {
                community: true,
                completions: {
                    where: user ? eq(questCompletions.user, user.id) : undefined,
                },
            },
            limit: context.limit ?? 3,
        });

        return fetchedQuests.map((quest) => ({
            id: quest.id,
            name: quest.name,
            description: quest.description,
            image: quest.image,
            xp: quest.xp,
            points: quest.points,
            completed: user ? quest.completions?.length > 0 : false,
            pointsLabel: quest.community.points?.name ?? "Points",
        }));
    },
});
