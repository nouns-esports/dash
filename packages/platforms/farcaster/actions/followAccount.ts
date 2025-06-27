import { createAction } from "~/packages/server/actions/createAction";
import { z } from "zod";
import { neynarClient } from "~/packages/server/clients/neynar";

export const followAccount = createAction({
    name: "Follow Account",
    schema: z.object({
        account: z.number().describe("The account to follow"),
    }),
    check: async ({ user, input }) => {
        const account = user.accounts.find((account) => account.platform === "farcaster");

        if (!account) return false;

        const response = await neynarClient.fetchBulkUsers([input.account], {
            viewerFid: Number(account.identifier),
        });

        const followAccount = response.users[0];

        if (!followAccount) return false;

        return !!followAccount.viewer_context?.following;
    },
});
