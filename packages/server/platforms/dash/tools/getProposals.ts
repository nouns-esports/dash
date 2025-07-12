import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { db } from "~/packages/db";
import { proposals, rounds, votes } from "~/packages/db/schema/public";
import { cosineDistance, eq } from "drizzle-orm";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const getProposals = createTool({
    id: "getProposals",
    description: "Get proposal(s) for a round",
    inputSchema: z.object({
        limit: z
            .number()
            .max(3)
            .optional()
            .describe("The number of proposals to get with a max of 3"),
        roundSearch: z.string().describe("A search term or phrase to filter rounds by"),
        proposalSearch: z
            .string()
            .optional()
            .describe("A search term or phrase to filter proposals by"),
    }),
    outputSchema: z.array(
        z.object({
            id: z.string().describe("The id of the proposal"),
            title: z.string().describe("The title of the proposal"),
            image: z.string().optional().describe("The image of the proposal"),
            content: z.string().describe("The text content of the proposal"),
            userVotes: z.number().describe("The number of votes the user has cast on the proposal"),
            round: z.object({
                id: z.string().describe("The id of the round"),
                name: z.string().describe("The name of the round"),
                image: z.string().describe("The image of the round"),
                description: z.string().describe("The description of the round"),
                start: z.date().describe("The start date of the round"),
                votingStart: z.date().describe("The voting start date of the round"),
                end: z.date().describe("The end date of the round"),
            }),
            author: z.object({
                name: z.string().describe("The name of the author"),
                image: z.string().describe("The image of the author"),
            }),
        }),
    ),
    execute: async ({ context, runtimeContext }) => {
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (!community) {
            throw new Error("Community is required to get rounds");
        }

        const roundEmbedding = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: context.roundSearch,
        });

        let proposalSearchEmbedding: number[] | undefined;

        if (context.proposalSearch) {
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-small"),
                value: context.proposalSearch,
            });

            proposalSearchEmbedding = embedding;
        }

        const fetchedRound = await db.pgpool.query.rounds.findFirst({
            where: eq(rounds.community, community.id),
            orderBy: roundEmbedding
                ? cosineDistance(rounds.embedding, roundEmbedding.embedding)
                : undefined,
            with: {
                proposals: {
                    limit: context.limit ?? 3,
                    orderBy: proposalSearchEmbedding
                        ? cosineDistance(proposals.embedding, proposalSearchEmbedding)
                        : undefined,
                    with: {
                        votes: {
                            where: eq(votes.user, user.id),
                        },
                        user: true,
                    },
                },
            },
        });

        if (!fetchedRound) {
            throw new Error("Round not found");
        }

        return fetchedRound.proposals.map((proposal) => ({
            id: proposal.id,
            title: proposal.title,
            image: proposal.image ?? undefined,
            content: proposal.content ?? "",
            userVotes: proposal.votes.reduce((acc, vote) => acc + vote.count, 0),
            round: {
                id: fetchedRound.id,
                name: fetchedRound.name,
                image: fetchedRound.image,
                description: fetchedRound.description,
                start: fetchedRound.start,
                votingStart: fetchedRound.votingStart,
                end: fetchedRound.end,
            },
            author: {
                name: proposal.user?.name ?? "Deleted User",
                image:
                    proposal.user?.image ??
                    "https://ipfs.nouns.gg/ipfs/bafkreifznv3isngocvxcddhmtercz7qbs5vvu5adrdgvqjucl36ipfyh3m",
            },
        }));
    },
});
