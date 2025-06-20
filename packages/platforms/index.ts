import { createPlatform } from "./createPlatform";
import { z } from "zod";

const discord = createPlatform({
    name: "Discord",
    image: "",
    connections: {
        server: {
            name: "Server",
            image: "",
            config: z.object({
                guild: z.string().describe("The Discord server ID"),
            }).describe("The config for a Discord server connection"),
        }
    },
    tools: {}
})

const farcaster = createPlatform({
    name: "Farcaster",
    image: "",
    connections: {
        account: {
            name: "Account",
            image: "",
            config: z.object({
                fid: z.number().describe("The Farcaster ID of the account"),
            }).describe("The config for a Farcaster account connection"),
        },
        channel: {
            name: "Channel",
            image: "",
            config: z.object({
                id: z.string().describe("The Farcaster channel ID"),
            }).describe("The config for a Farcaster channel connection"),
        }
    },
    tools: {}
})

export const platforms = {
    discord,
    farcaster,
} as const;

export type Platforms = keyof typeof platforms;

export type Connections = {
    [K in keyof typeof platforms]: {
        [C in keyof (typeof platforms)[K]['connections']]: `${K & string}:${C & string}`
    }[keyof (typeof platforms)[K]['connections']]
}[keyof typeof platforms];