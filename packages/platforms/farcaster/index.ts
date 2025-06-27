import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { createPost } from "./actions/createPost";
import { followAccount } from "./actions/followAccount";
import { likePost } from "./actions/likePost";
import { repostPost } from "./actions/repostPost";

export const farcaster = createPlatform({
    name: "Farcaster",
    image: "",
    config: z
        .object({
            accounts: z.array(
                z.object({
                    fid: z.number().describe("The Farcaster ID of the account"),
                }),
            ),
            channels: z.array(
                z.object({
                    id: z.string().describe("The Farcaster channel ID"),
                }),
            ),
        })
        .describe("The config for the Farcaster plugin"),
    actions: {
        createPost,
        followAccount,
        likePost,
        repostPost,
    },
});
