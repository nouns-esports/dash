import { db } from "~/packages/db";
import { accounts, communities, communityAdmins, escrows, passes, users } from "~/packages/db/schema/public";
import { privyClient } from "../clients/privy";
import { eq, sql } from "drizzle-orm";
import type { User } from "@privy-io/server-auth";
import { pinataClient } from "../clients/pinata";

export async function createUser(input: ({
    platform: "discord"
    username: string;
    image: string;
    name: string;
    subject: string;
} | {
    platform: "farcaster"
    username: string;
    image: string;
    name: string;
    fid: number;
    ownerAddress: string;
})) {
    let user: typeof users.$inferSelect & {
        accounts: typeof accounts.$inferSelect[];
        passes: typeof passes.$inferSelect[];
        communities: Array<typeof communityAdmins.$inferSelect & {
            community: typeof communities.$inferSelect
        }>;
    } | undefined;

    await db.primary.transaction(async (tx) => {
        let privyUser: User | null = null;

        if (input.platform === "discord") {
            privyUser = await privyClient.getUserByDiscordUsername(input.username);
        }

        if (input.platform === "farcaster") {
            privyUser = await privyClient.getUserByFarcasterId(input.fid);
        }

        if (!privyUser) {
            if (input.platform === "discord") {
                privyUser = await privyClient.importUser({
                    linkedAccounts: [
                        {
                            type: "discord_oauth",
                            username: input.username,
                            subject: input.subject,
                            email: null,
                        }
                    ]
                })
            }

            if (input.platform === "farcaster") {
                privyUser = await privyClient.importUser({
                    linkedAccounts: [
                        {
                            type: "farcaster",
                            username: input.username,
                            fid: input.fid,
                            ownerAddress: input.ownerAddress,
                        }
                    ]
                })
            }

            if (!privyUser) {
                throw new Error("Failed to create user");
            }
        }

        const image = await pinataClient.upload.url(input.image);

        const [createdUser] = await tx.insert(users).values({
            name: input.name,
            image: image.IpfsHash,
            privyId: privyUser.id,
            createdAt: privyUser.createdAt,
        }).returning();

        const identifier = input.platform === "discord" ? input.subject : input.fid.toString();

        await tx.insert(accounts).values({
            identifier,
            platform: input.platform,
            user: createdUser.id,
        }).onConflictDoUpdate({
            target: [accounts.identifier, accounts.platform],
            set: {
                user: createdUser.id,
            },
        })

        const unclaimedEscrows = await tx.query.escrows.findMany({
            where: eq(escrows.heir, identifier),
        });

        for (const escrow of unclaimedEscrows) {
            await tx.insert(passes).values({
                user: createdUser.id,
                community: escrow.community,
                points: escrow.points,
                xp: escrow.xp,
            }).onConflictDoUpdate({
                target: [passes.user, passes.community],
                set: {
                    points: sql`${passes.points} + ${escrow.points}`,
                    xp: sql`${passes.xp} + ${escrow.xp}`,
                },
            });
        }

        user = await tx.query.users.findFirst({
            where: eq(users.id, createdUser.id),
            with: {
                passes: true,
                accounts: true,
                communities: {
                    with: {
                        community: true,
                    }
                },
            },
        });
    });

    if (!user) {
        throw new Error("Failed to create user");
    }

    return user;
}