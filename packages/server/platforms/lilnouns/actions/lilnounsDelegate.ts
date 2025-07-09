import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";
import { privyClient } from "~/packages/server/clients/privy";
import { db } from "~/packages/db";
import { erc721Balances, lilnounDelegates } from "~/packages/db/schema/indexer";
import { inArray, eq, and } from "drizzle-orm";

export const lilnounsDelegate = createAction({
    name: "LilNouns Delegate",
    schema: z.object({}),
    check: async ({ user }) => {
        const privyUser = await privyClient.getUserById(user.id);

        if (!privyUser) return false;

        const wallets = privyUser.linkedAccounts.filter((account) => account.type === "wallet");

        if (wallets.length === 0) return false;

        const [isDelegate, isHolder] = await Promise.all([
            db.primary.query.lilnounDelegates.findFirst({
                where: inArray(
                    lilnounDelegates.to,
                    wallets.map((w) => w.address.toLowerCase() as `0x${string}`),
                ),
            }),
            db.primary.query.erc721Balances.findFirst({
                where: and(
                    inArray(
                        erc721Balances.account,
                        wallets.map((w) => w.address.toLowerCase() as `0x${string}`),
                    ),
                    eq(erc721Balances.collection, "0x4b10701bfd7bfedc47d50562b76b436fbb5bdb3b"),
                ),
            }),
        ]);

        return !!isDelegate || !!isHolder;
    },
});
