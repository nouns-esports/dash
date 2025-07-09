import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";
import { neynarClient } from "~/packages/server/clients/neynar";

export const createPost = createAction({
    name: "Create Post",
    schema: z.object({
        channel: z.string().describe("The channel to create a post in"),
    }),
    check: async ({ user, input }) => {
        const account = user.accounts.find((account) => account.platform === "farcaster");

        if (!account) return false;

        const response = await neynarClient.fetchCastsForUser(Number(account.identifier), {
            limit: 1,
            channelId: input.channel,
        });

        return response.casts.length > 0;
    },
});
