import { db } from "~/packages/db";
import { createAction } from "../../../createAction";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { passes } from "~/packages/db/schema/public";

export const reachPercentile = createAction({
    name: "Reach Percentile",
    schema: z.object({
        percentile: z.number().describe("The percentile to reach"),
    }),
    check: async ({ user, community, input }) => {
        const pass = await db.primary.query.passes.findFirst({
            where: and(eq(passes.user, user.id), eq(passes.community, community.id)),
            extras: {
                percentile: sql<number>`
                (
                    (
                        SELECT 1 + COUNT(*) 
                        FROM ${passes} AS l2 
                        WHERE l2.community = ${passes.community}
                        AND l2.xp > ${passes.xp}
                    )::float
                    /
                    (
                        SELECT COUNT(*) 
                        FROM ${passes} AS l3 
                        WHERE l3.community = ${passes.community}
                    )
                )
            `.as("percentile"),
            },
        });

        if (!pass) return false;

        return pass.percentile <= input.percentile;
    },
});
