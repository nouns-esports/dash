import { createAction } from "../createAction";
import { z } from "zod";

export const linkTwitter = createAction({
    name: "linkTwitter",
    schema: z.object({}),
    check: async ({ user }) => {
        for (const account of user.accounts) {
            if (account.platform === "farcaster") {
                return true;
            }
        }

        return false;
    },
});
