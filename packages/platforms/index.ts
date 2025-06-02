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
                id: z.string().describe("The Discord server ID"),
            }).describe("The config for a Discord server connection"),
        }
    },
    tools: {}
})

const farcaster = createPlatform({
    name: "Farcaster",
    image: "",
    connections: {
        // TODO: Change this so that the type and returned value is farcaster:account
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
} satisfies Record<string, ReturnType<typeof createPlatform>>

export type Platforms = keyof typeof platforms;
export type Connections = {
    [K in keyof typeof platforms]: keyof (typeof platforms)[K]['connections']
}[keyof typeof platforms];

export const platformTypes = Object.keys(platforms) as [Platforms, ...(Platforms extends any ? Exclude<Platforms, Platforms> extends never ? [] : Platforms[] : never)];
export const connectionTypes = Object.values(platforms).flatMap((platform) => Object.keys(platform.connections)) as [Connections, ...(Connections extends any ? Exclude<Connections, Connections> extends never ? [] : Connections[] : never)];