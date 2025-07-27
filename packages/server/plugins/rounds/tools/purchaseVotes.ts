import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { db } from "~/packages/db";
import { sql } from "drizzle-orm";
import { escrows, purchasedVotes, passes, points } from "~/packages/db/schema/public";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";
import { CustomError } from "~/packages/server/utils/tryCatch";

export const purchaseVotes = createTool({
    id: "purchaseVotes",
    description: "Purchase votes for the Nounsvitational round",
    inputSchema: z.object({
        count: z
            .number()
            .int()
            .min(1)
            .describe("The number of votes to purchase (100 points/gold = 1 vote)"),
    }),
    outputSchema: z.boolean().describe("Whether the votes were purchased successfully"),
    execute: async ({ context, runtimeContext }) => {
        throw new CustomError({
            name: "DISABLED",
            message: "Purchasing votes is currently disabled",
        });

        // await db.primary.transaction(async (tx) => {
        //     const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        //     const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        //     if (!community) {
        //         throw new CustomError({
        //             name: "COMMUNITY_REQUIRED",
        //             message: "Community is required to purchase votes",
        //         });
        //     }

        //     const pass = user.passes.find((pass) => pass.community.id === community.id);

        //     const cost = context.count * 100;

        //     if (!pass || pass.points < cost) {
        //         throw new Error("You do not have enough points to purchase votes");
        //     }

        //     await tx
        //         .insert(passes)
        //         .values({
        //             user: user.id,
        //             community: community.id,
        //         })
        //         .onConflictDoUpdate({
        //             target: [passes.user, passes.community],
        //             set: {
        //                 points: sql`${passes.points} - ${cost}`,
        //             },
        //         });

        //     await tx.insert(points).values({
        //         community: community.id,
        //         from: user.id,
        //         to: null,
        //         amount: cost,
        //         for: "PURCHASING_VOTES",
        //     });

        //     await tx
        //         .insert(purchasedVotes)
        //         .values({
        //             user: user.id,
        //             round: "efaecac8-883f-4a57-91c4-4ca47d917895",
        //             count: context.count,
        //         })
        //         .onConflictDoUpdate({
        //             target: [purchasedVotes.user, purchasedVotes.round],
        //             set: {
        //                 count: sql`${purchasedVotes.count} + ${context.count}`,
        //             },
        //         });
        // });

        // return true;
    },
});
