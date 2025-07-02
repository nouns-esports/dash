import { eq } from "drizzle-orm";
import { db } from "~/packages/db";
import { communities } from "~/packages/db/schema/public";

export async function getCommunity(input: { id: string }) {
    return db.pgpool.query.communities.findFirst({
        where: eq(communities.id, input.id),
        with: {
            admins: true,
            connections: true,
        },
    });
}
