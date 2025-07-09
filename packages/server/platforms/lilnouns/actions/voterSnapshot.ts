import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";
import { privyClient } from "~/packages/server/clients/privy";
import { db } from "~/packages/db";
import { eq, and, ilike } from "drizzle-orm";
import { snapshots } from "~/packages/db/schema/public";

export const voterSnapshot = createAction({
    name: "Voter Snapshot",
    schema: z.object({}),
    check: async ({ user }) => {
        const privyUser = await privyClient.getUserById(user.id);

        if (!privyUser) return false;

        const wallets = privyUser.linkedAccounts.filter((account) => account.type === "wallet");

        for (const wallet of wallets) {
            const snapshot = await db.pgpool.query.snapshots.findFirst({
                where: and(
                    eq(snapshots.type, "lilnouns-open-round-fixed"),
                    ilike(snapshots.tag, `${wallet.address.toLowerCase()}:%`),
                ),
            });

            if (snapshot) {
                return true;
            }
        }

        return false;
    },
});
