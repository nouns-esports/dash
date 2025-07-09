import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";
import { privyClient } from "~/packages/server/clients/privy";

export const graduateTraits = createAction({
    name: "Graduate Traits",
    schema: z.object({
        count: z.number().min(1).describe("The number of traits to graduate"),
    }),
    check: async ({ user, input }) => {
        const privyUser = await privyClient.getUserById(user.id);

        if (!privyUser) return false;

        const wallets = privyUser.linkedAccounts.filter((account) => account.type === "wallet");

        const graduates = (await fetch("https://gallery.noundry.wtf/api/graduations").then((res) =>
            res.json(),
        )) as Record<string, number | undefined>;

        for (const wallet of wallets) {
            const count = graduates[wallet.address.toLowerCase()];

            if (count && count >= input.count) {
                return true;
            }
        }

        return false;
    },
});
