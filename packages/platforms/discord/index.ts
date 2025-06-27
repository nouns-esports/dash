import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { haveRole } from "./actions/haveRole";
import { joinServer } from "./actions/joinServer";

export const discord = createPlatform({
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
