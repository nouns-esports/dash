import { createAction } from "~/packages/server/actions/createAction";
import { z } from "zod";
import { privyClient } from "~/packages/server/clients/privy";
import { db } from "~/packages/db";
import { erc721Balances, nounDelegates } from "~/packages/db/schema/indexer";
import { inArray, eq, and } from "drizzle-orm";

export const nounsDelegate = createAction({
    name: "Nouns Delegate",
    schema: z.object({}),
    check: async ({ user }) => {
        const privyUser = await privyClient.getUserById(user.id);

        if (!privyUser) return false;

        const wallets = privyUser.linkedAccounts.filter((account) => account.type === "wallet");

        if (wallets.length === 0) return false;

        const [isDelegate, isHolder] = await Promise.all([
            db.primary.query.nounDelegates.findFirst({
                where: inArray(
                    nounDelegates.to,
                    wallets.map((w) => w.address.toLowerCase() as `0x${string}`),
                ),
            }),
            db.primary.query.erc721Balances.findFirst({
                where: and(
                    inArray(
                        erc721Balances.account,
                        wallets.map((w) => w.address.toLowerCase() as `0x${string}`),
                    ),
                    eq(erc721Balances.collection, "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03"),
                ),
            }),
        ]);

        return !!isDelegate || !!isHolder;
    },
});
