import { env } from "~/env";
import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";

export const joinServer = createAction({
    name: "Join Server",
    schema: z.object({
        server: z.string().describe("The Discord server ID"),
    }),
    check: async ({ input, user, community }) => {
        const account = user.accounts.find((account) => account.platform === "discord");

        if (!account) return false;

        const server = community.connections.find(
            (connection) =>
                connection.platform === "discord" && connection.config?.guild === input.server,
        );

        if (!server) {
            throw new Error("The provided server is not linked to this community");
        }

        const response = await fetch(
            `https://discord.com/api/guilds/${input.server}/members/${account.identifier}`,
            {
                headers: {
                    Authorization: `Bot ${env.DISCORD_TOKEN}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) return false;

        return false;
    },
});
