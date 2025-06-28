import { db } from "~/packages/db";
import { eq, and, sql } from "drizzle-orm";
import { predictions } from "~/packages/db/schema/public";

export async function getPrediction(
    input: { user: string } & ({ id: string } | { handle: string; community: string }),
) {
    return db.pgpool.query.predictions.findFirst({
        where:
            "id" in input
                ? eq(predictions.id, input.id)
                : and(
                      eq(predictions.handle, input.handle),
                      input.community
                          ? eq(
                                predictions.community,
                                sql`(SELECT id FROM communities WHERE communities.handle = ${input.community})`,
                            )
                          : undefined,
                  ),
        with: {
            outcomes: true,
        },
    });
}
