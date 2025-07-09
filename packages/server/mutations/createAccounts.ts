import { db } from "~/packages/db";
import { accounts } from "~/packages/db/schema/public";
import { and, eq, inArray } from "drizzle-orm";
import type { Platforms } from "~/packages/server/platforms";

export async function createAccounts(input: {
    identifiers: string[];
    platform: Platforms;
}) {
    await db.primary
        .insert(accounts)
        .values(
            input.identifiers.map((identifier) => ({
                identifier,
                platform: input.platform,
            })),
        )
        .onConflictDoNothing();

    return db.primary.query.accounts.findMany({
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
