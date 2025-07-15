import { db } from "~/packages/db";

export const getRaffle = async (input: { id: string }) => {
    return db.primary.query.raffles.findFirst({
        where: (t, { eq }) => eq(t.id, input.id),
    });
};
