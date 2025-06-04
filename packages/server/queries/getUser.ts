import { db } from "~/packages/db";
import { users, accounts } from "~/packages/db/schema/public";
import type { Platforms } from "~/packages/platforms";
import { sql } from "drizzle-orm";

export async function getUser(input: {
    identifier: string;
    platform: Platforms;
}) {
    return db.pgpool.query.users.findFirst({
        where: sql`${users.id} = (
            SELECT ${accounts.user}
            FROM ${accounts}
            WHERE ${accounts.identifier} = ${input.identifier}
            AND ${accounts.platform} = ${input.platform}
        )`,
        with: {
            passes: true,
            accounts: true,
            communities: {
                with: {
                    community: true,
                }
            },
        }
    });
}