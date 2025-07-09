import { db } from "~/packages/db";
import { users, accounts, passes, communities } from "~/packages/db/schema/public";
import { sql } from "drizzle-orm";
import type { Platforms } from "~/packages/server/platforms";

export type User = typeof users.$inferSelect & {
    accounts: (typeof accounts.$inferSelect)[];
    passes: Array<typeof passes.$inferSelect & { community: typeof communities.$inferSelect }>;
};

export async function getUser(input: {
    identifier: string;
    platform: Platforms;
}): Promise<User | undefined> {
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
                },
            },
            accounts: true,
        },
    });
}
