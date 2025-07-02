import { db } from "~/packages/db";
import { communities, communityConnections } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";

export async function getCommunityFromServer(input: { server: string }) {
    const community = await db.pgpool.query.communities.findFirst({
        where: sql`
            ${communities.id} = (
                SELECT cp.community
                FROM ${communityConnections} AS cp
                WHERE cp.platform = 'discord'
                AND EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(cp.config->'servers') AS item
                    WHERE item->>'id' = ${input.server}
                )
            )
        `,
        with: {
            admins: true,
            connections: true,
        },
    });

    return community;
}
