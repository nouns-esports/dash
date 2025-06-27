import { db } from "~/packages/db";
import { eq, and, sql } from "drizzle-orm";
import { quests, questCompletions } from "~/packages/db/schema/public";

export async function getQuest(
    input: { user: string } & ({ id: string } | { handle: string; community: string }),
) {
    return db.pgpool.query.quests.findFirst({
        where:
            "id" in input
                ? eq(quests.id, input.id)
                : and(
                      eq(quests.handle, input.handle),
                      input.community
                          ? eq(
                                quests.community,
                                sql`(SELECT id FROM communities WHERE communities.handle = ${input.community})`,
                            )
                          : undefined,
                  ),
        with: {
            completions: input.user
                ? {
                      where: eq(questCompletions.user, input.user),
                      limit: 1,
                  }
                : undefined,
            // event: {
            //     with: {
            //         community: true,
            //     },
            // },
            actions: true,
            community: true,
        },
    });
}
