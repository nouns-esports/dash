import { db } from "~/packages/db";
import { passes, questCompletions, quests, users, xp } from "~/packages/db/schema/public";
import { eq, sql } from "drizzle-orm";
import { getAction } from "../actions";

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
        throw new Error("User not found");
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
                    connections: true,
                    admins: true,
                },
            },
        },
    });

    if (!quest) {
        throw new Error("Quest not found");
    }

    if (quest.completions?.length > 0) {
        return {
            state: "already-completed",
        };
    }

    if (!quest.active) {
        throw new Error("Quest is not active");
    }

    const now = new Date();

    if (quest.deprecated_start && new Date(quest.deprecated_start) > now) {
        throw new Error("Quest hasn't started yet");
    }

    if (quest.deprecated_end && new Date(quest.deprecated_end) < now) {
        throw new Error("Quest has closed");
    }

    const actions = await Promise.all(
        quest.actions.map(async (actionState) => {
            const action = getAction({
                action: actionState.action,
                platform: actionState.platform,
            });

            if (!action) {
                throw new Error(
                    `Action ${actionState.action} not found ${actionState.platform ? `for platform ${actionState.platform}` : ""}`,
                );
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
            community: quest.community,
        });

        await tx
            .insert(passes)
            .values({
                user: input.user,
                xp: quest.xp,
                community: quest.community,
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
