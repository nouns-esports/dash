import { eq, sql } from "drizzle-orm";
import { db } from "~/packages/db";
import { communities } from "~/packages/db/schema/public";

export async function getCommunity(input: { id: string, }) {
    return db.pgpool.query.communities.findFirst({
        where: eq(communities.id, input.id),
        with: {
            admins: true,
            connections: true,
        },
        extras: {
            boosts: sql<number>`
                (
                    SELECT COALESCE(SUM(passes.boosts), 0)
                    FROM passes
                    WHERE passes.community = ${communities.id}
                )
            `.as("boosts")
        }
    });
}