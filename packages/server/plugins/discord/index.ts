import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { haveRole } from "./actions/haveRole";
import { joinServer } from "./actions/joinServer";

export const discord = createPlugin({
    name: "Discord",
    image: "",
    config: z
        .object({
            servers: z.array(
                z.object({
                    id: z.string().describe("The Discord server ID"),
                    announcementChannel: z
                        .string()
                        .nullable()
                        .describe("The channel ID to send announcements in"),
                }),
            ),
        })
        .describe("The config for the Discord plugin"),
    actions: {
        haveRole,
        joinServer,
    },
});
