import { db } from "~/packages/db";
import { accounts, communities, communityAdmins, escrows, passes, points, users, xp } from "~/packages/db/schema/public";
import { privyClient } from "../clients/privy";
import { and, eq, sql } from "drizzle-orm";
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
        passes: Array<typeof passes.$inferSelect & {
            community: typeof communities.$inferSelect;
        }>;
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
        }).returning();

        const identifier = input.platform === "discord" ? input.subject : input.fid.toString();

        const [createdAccount] = await tx.insert(accounts).values({
            identifier,
            platform: input.platform,
            user: createdUser.id,
        }).onConflictDoUpdate({
            target: [accounts.identifier, accounts.platform],
            set: {
                user: createdUser.id,
            },
        }).returning();

        const escrow = await tx.query.escrows.findFirst({
            where: and(eq(escrows.heir, createdAccount.id), eq(escrows.claimed, false)),
        });

        if (escrow) {
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

            if (escrow.points > 0) {
                await tx.insert(points).values({
                    community: escrow.community,
                    fromEscrow: escrow.id,
                    to: createdUser.id,
                    amount: escrow.points,
                });
            }

            if (escrow.xp > 0) {
                await tx.insert(xp).values({
                    user: createdUser.id,
                    community: escrow.community,
                    amount: escrow.xp,
                });
            }

            await tx.update(escrows).set({
                claimed: true,
            }).where(eq(escrows.id, escrow.id));
        }

        user = await tx.query.users.findFirst({
            where: eq(users.id, createdUser.id),
            with: {
                passes: {
                    with: {
                        community: true,
                    }
                },
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