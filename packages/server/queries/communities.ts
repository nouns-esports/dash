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
        }
    });

    return community;
}