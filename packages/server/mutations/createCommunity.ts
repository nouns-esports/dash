import { db } from "~/packages/db";
import { pinataClient } from "../clients/pinata";
import { communities, communityAdmins, communityConnections } from "~/packages/db/schema/public";
import { eq } from "drizzle-orm";
import type { platforms } from "~/packages/platforms";
import { z } from "zod";

export async function createCommunity(input: {
    name: string;
    image: string;
    user: string;
} & ({
    platform: "discord";
    connection: "server";
    config: z.infer<typeof platforms.discord["connections"]["server"]["config"]>;
})) {
    let community: typeof communities.$inferSelect & {
        admins: typeof communityAdmins.$inferSelect[];
        connections: typeof communityConnections.$inferSelect[];
    } | undefined;

    await db.primary.transaction(async (tx) => {
        const image = await pinataClient.upload.url(input.image);

        const [createdCommunity] = await tx.insert(communities).values({
            handle: input.name.toLowerCase().replace(/ /g, "-"),
            name: input.name,
            image: image.IpfsHash,
        }).returning();

        await tx.insert(communityAdmins).values({
            community: createdCommunity.id,
            user: input.user,
        });

        await tx.insert(communityConnections).values({
            community: createdCommunity.id,
            platform: input.platform,
            type: input.connection,
            config: input.config,
        });

        community = await tx.query.communities.findFirst({
            where: eq(communities.id, createdCommunity.id),
            with: {
                admins: true,
                connections: true,
            },
        });
    });

    if (!community) {
        throw new Error("Failed to create community");
    }

    return community;
}