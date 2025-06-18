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
            SELECT a.user
            FROM ${accounts} AS a
            WHERE a.identifier = ${input.identifier}
              AND a.platform   = ${input.platform}
          )`,
        with: {
            passes: {
                with: {
                    community: true,
                }
            },
            accounts: true,
            communities: {
                with: {
                    community: true,
                }
            },
        }
    });
}