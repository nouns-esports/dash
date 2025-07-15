import { db } from "~/packages/db";
import { bets, predictions, outcomes } from "~/packages/db/schema/public";
import { eq, and } from "drizzle-orm";

export async function placePrediction(input: {
    prediction: string;
    outcome: string;
    user: string;
}) {
    const prediction = await db.primary.query.predictions.findFirst({
        where: eq(predictions.id, input.prediction),
        with: {
            outcomes: {
                where: eq(outcomes.id, input.outcome),
            },
            bets: {
                where: and(eq(bets.user, input.user), eq(bets.prediction, input.prediction)),
            },
        },
    });

    if (!prediction) {
        throw new Error("Prediction not found");
    }

    if (prediction.outcomes.length === 0) {
        throw new Error("Outcome not found");
    }

    if (prediction.closed) {
        throw new Error("Prediction is closed");
    }

    if (prediction.resolved) {
        throw new Error("Prediction is resolved");
    }

    const now = new Date();

    if (prediction.start && now < new Date(prediction.start)) {
        throw new Error("Prediction is not yet started");
    }

    if (prediction.end && now > new Date(prediction.end)) {
        throw new Error("Prediction has ended");
    }

    if (prediction.bets.length > 0) {
        return {
            state: "already-bet",
        };
    }

    await db.primary.transaction(async (tx) => {
        await tx.insert(bets).values({
            user: input.user,
            prediction: input.prediction,
            outcome: input.outcome,
            timestamp: now,
            amount: 0,
        });
    });

    return {
        state: "placed",
    };
}
