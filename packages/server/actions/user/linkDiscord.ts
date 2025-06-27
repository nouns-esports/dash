import { createAction } from "../createAction";
import { z } from "zod";

export const linkDiscord = createAction({
    name: "linkDiscord",
    schema: z.object({
        minAge: z.number().optional().describe("The minimum account age, in months"),
    }),
    check: async ({ input, user }) => {
        for (const account of user.accounts) {
            if (account.platform === "discord") {
                if (input.minAge !== undefined) {
                    const creationDate = new Date(
                        Number((BigInt(account.identifier) >> 22n) + 1420070400000n),
                    );

                    const now = new Date();
                    const monthsAgo = new Date(
                        now.getTime() - input.minAge * 30 * 24 * 60 * 60 * 1000,
                    );

                    if (creationDate < monthsAgo) return false;
                }

                return true;
            }
        }

        return false;
    },
});
