import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { db } from "~/packages/db";
import { proposals, rounds, votes } from "~/packages/db/schema/public";
import { eq } from "drizzle-orm";

export const getRounds = createTool({
    id: "getRounds",
    description: "Get round(s) for a community",
    inputSchema: z.object({
        limit: z.number().max(3).optional().describe("The number of rounds to get with a max of 3"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the round"),
            name: z.string().describe("The name of the round"),
            image: z.string().describe("The image of the round"),
            description: z.string().describe("The description of the round"),
            start: z.date().describe("The round start date"),
            votingStart: z.date().describe("The round voting start date"),
            end: z.date().describe("The round end date"),
            userVotes: z.array(z.object({})),
            userProposals: z.array(z.object({})),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get rounds");
        }

        const fetchedRounds = await db.pgpool.query.rounds.findMany({
            where: eq(rounds.community, community.id),
            with: {
                votes: {
                    where: eq(votes.user, user.id),
                    with: {
                        proposal: true,
                    },
                },
                proposals: {
                    where: eq(proposals.user, user.id),
                },
            },
        });

        return fetchedRounds.map((round) => ({
            id: round.id,
            name: round.name,
            image: round.image,
            description: round.description,
            start: round.start,
            votingStart: round.votingStart,
            end: round.end,
            userVotes: round.votes.map((vote) => ({
                id: vote.id,
                vote: vote.count,
                proposal: vote.proposal,
            })),
            userProposals: round.proposals.map((proposal) => ({
                id: proposal.id,
                title: proposal.title,
                content: proposal.content,
            })),
        }));
    },
});
