import { db } from "~/packages/db";
import { createAction } from "../../createAction";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { passes } from "~/packages/db/schema/public";

export const leaderboardPosition = createAction({
    name: "Leaderboard Position",
    schema: z.object({
        minPosition: z.number().describe("The minimum position to reach"),
    }),
    check: async ({ user, community, input }) => {
        const pass = await db.pgpool.query.passes.findFirst({
            where: and(eq(passes.community, community.id), eq(passes.user, user.id)),
            orderBy: [desc(passes.xp)],
            extras: {
                rank: sql<number>`
            (
              SELECT COUNT(*) + 1
              FROM ${passes} AS p2
              WHERE p2.community = ${passes.community}
                AND p2.xp > ${passes.xp}
            )
          `.as("rank"),
            },
        });

        if (!pass) return false;

        return pass.rank <= input.minPosition;
    },
});
