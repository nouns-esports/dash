import { db } from "~/packages/db";
import { communities, communityPlugins } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";

export async function getCommunityFromServer(input: { server: string }) {
    return db.pgpool.query.communities.findFirst({
        where: sql`
            ${communities.id} = (
                SELECT cp.community
                FROM ${communityPlugins} AS cp
                WHERE cp.plugin = 'discord'
                AND EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(cp.config->'servers') AS item
                    WHERE item->>'id' = ${input.server}
                )
            )
        `,
        with: {
            admins: true,
            plugins: true,
        },
    });
}
