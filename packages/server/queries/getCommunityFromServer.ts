import { db } from "~/packages/db";
import { communities, communityConnections } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";

export async function getCommunityFromServer(input: {
    guild: string;
}) {
    const community = await db.pgpool.query.communities.findFirst({
        where: sql`${communities.id} = (
            SELECT cc.community
            FROM ${communityConnections} AS cc
            WHERE cc.platform = 'discord'
              AND cc.type = 'discord:server'
              AND cc.config->>'guild' = ${input.guild}
          )`,
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
            `.as("boosts"),
        },
    });

    return community;
}