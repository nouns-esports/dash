import { db } from "~/packages/db";
import { eq, sql } from "drizzle-orm";
import { passes, points, raffleEntries, xp } from "~/packages/db/schema/public";
import { CustomError } from "~/packages/server/utils/tryCatch";

export async function enterRaffle(input: { user: string; raffle: string; amount: number }) {
    const raffle = await db.primary.query.raffles.findFirst({
        where: (t, { eq }) => eq(t.id, input.raffle),
        with: {
            event: true,
            entries: {
                where: (t, { eq }) => eq(t.user, input.user),
            },
        },
    });

    if (!raffle) {
        throw new CustomError({ name: "RAFFLE_NOT_FOUND", message: "Raffle not found" });
    }

    const now = new Date();

    if (now < new Date(raffle.start)) {
        throw new CustomError({
            name: "RAFFLE_NOT_STARTED",
            message: "Raffle has not started yet",
        });
    }

    if (now > new Date(raffle.end)) {
        throw new CustomError({ name: "RAFFLE_ENDED", message: "Raffle has ended" });
    }

    if (raffle.limit) {
        const userEntries = raffle.entries.reduce((acc, curr) => acc + curr.amount, 0);

        if (userEntries + input.amount > raffle.limit) {
            throw new CustomError({
                name: "RAFFLE_ENTRY_LIMIT_REACHED",
                message: "You have reached the maximum number of entries for this raffle",
            });
        }
    }

    const earnedXP = 10 * input.amount;

    await db.primary.transaction(async (tx) => {
        const cost = raffle.cost * input.amount;

        const [raffleEntry] = await tx
            .insert(raffleEntries)
            .values({
                raffle: input.raffle,
                user: input.user,
                amount: input.amount,
            })
            .returning({
                id: raffleEntries.id,
            });

        await tx.insert(xp).values({
            user: input.user,
            amount: earnedXP,
            raffle: input.raffle,
            raffleEntry: raffleEntry.id,
            community: raffle.community,
            for: "ENTERING_RAFFLE",
        });

        await tx
            .insert(passes)
            .values({
                user: input.user,
                xp: earnedXP,
                community: raffle.community,
            })
            .onConflictDoUpdate({
                target: [passes.user, passes.community],
                set: {
                    xp: sql`${passes.xp} + ${earnedXP}`,
                    points: sql`${passes.points} - ${cost}`,
                },
            });

        await tx.insert(points).values({
            from: input.user,
            to: null,
            amount: cost,
            raffle: input.raffle,
            raffleEntry: raffleEntry.id,
            community: raffle.community,
            for: "ENTERING_RAFFLE",
        });
    });

    return {
        state: "entered",
        xp: earnedXP,
    };
}
