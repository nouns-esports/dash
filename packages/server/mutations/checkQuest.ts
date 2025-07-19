import { db } from "~/packages/db";
import { passes, questCompletions, quests, users, xp } from "~/packages/db/schema/public";
import { eq, sql } from "drizzle-orm";
import { getAction } from "~/packages/server/plugins";
import { CustomError } from "~/packages/server/utils/tryCatch";

export async function checkQuest(input: { user: string; quest: string }) {
    const user = await db.primary.query.users.findFirst({
        where: eq(users.id, input.user),
        with: {
            accounts: true,
            passes: {
                with: {
                    community: true,
                },
            },
        },
    });

    if (!user) {
        throw new CustomError({ name: "USER_NOT_FOUND", message: "User not found" });
    }

    const quest = await db.primary.query.quests.findFirst({
        where: eq(quests.id, input.quest),
        with: {
            completions: {
                where: eq(questCompletions.user, input.user),
                limit: 1,
            },
            actions: true,
            community: {
                with: {
                    plugins: true,
                    admins: true,
                },
            },
        },
    });

    if (!quest) {
        throw new CustomError({ name: "QUEST_NOT_FOUND", message: "Quest not found" });
    }

    if (quest.completions?.length > 0) {
        return {
            state: "already-completed",
        };
    }

    if (!quest.active) {
        throw new CustomError({ name: "QUEST_NOT_ACTIVE", message: "Quest is not active" });
    }

    const now = new Date();

    if (quest.start && quest.start > now) {
        throw new CustomError({ name: "QUEST_NOT_STARTED", message: "Quest hasn't started yet" });
    }

    if (quest.end && quest.end < now) {
        throw new CustomError({ name: "QUEST_CLOSED", message: "Quest has closed" });
    }

    const actions = await Promise.all(
        quest.actions.map(async (actionState) => {
            const action = getAction({
                action: actionState.action,
                plugin: actionState.plugin ?? "dash",
            });

            if (!action) {
                throw new CustomError({
                    name: "ACTION_NOT_FOUND",
                    message: `Action ${actionState.action} not found ${actionState.plugin ? `for plugin ${actionState.plugin}` : ""}`,
                });
            }

            return {
                ...actionState,
                completed: await action.check({
                    user,
                    input: actionState.input,
                    community: quest.community,
                }),
            };
        }),
    );

    if (!actions.every((action) => action.completed)) {
        return {
            state: "not-completed",
        };
    }

    await db.primary.transaction(async (tx) => {
        await tx.insert(xp).values({
            quest: quest.id,
            user: input.user,
            amount: quest.xp,
            community: quest.community.id,
        });

        await tx
            .insert(passes)
            .values({
                user: input.user,
                xp: quest.xp,
                community: quest.community.id,
            })
            .onConflictDoUpdate({
                target: [passes.user, passes.community],
                set: {
                    xp: sql`${passes.xp} + ${quest.xp}`,
                },
            });

        await tx.insert(questCompletions).values({
            quest: quest.id,
            user: input.user,
        });
    });

    return {
        state: "claimed",
        xp: quest.xp,
    };
}
