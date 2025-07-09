import { db } from "~/packages/db";
import { accounts } from "~/packages/db/schema/public";
import { and, eq, inArray } from "drizzle-orm";
import type { Platforms } from "~/packages/server/platforms";

export async function getMentionedAccounts(input: {
    identifiers: string[];
    platform: Platforms;
}) {
    return db.pgpool.query.accounts.findMany({
        where: and(
            inArray(accounts.identifier, input.identifiers),
            eq(accounts.platform, input.platform),
        ),
        with: {
            user: {
                with: {
                    passes: true,
                },
            },
        },
    });
}
