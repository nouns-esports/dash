import { privyClient } from "~/packages/server/clients/privy";
import { createAction } from "../../createAction";
import { z } from "zod";

export const linkEmail = createAction({
    name: "linkEmail",
    schema: z.object({}),
    check: async ({ user }) => {
        const privyUser = await privyClient.getUserById(user.privyId);

        if (!privyUser) return false;

        if (privyUser.email?.address) return true;

        return false;
    },
});
