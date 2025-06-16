import { db } from "~/packages/db";
import { communities, communityConnections } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";

export async function getCommunityFromServer(input: {
    guild: string;
}) {
    const community = await db.pgpool.query.communities.findFirst({
        where: sql`${communities.id} = (
            SELECT ${communityConnections.community}
            FROM ${communityConnections}
            WHERE ${communityConnections.platform} = 'discord'
            AND ${communityConnections.type} = 'server'
            AND ${communityConnections.config}->>'guildId' = ${input.guild}
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