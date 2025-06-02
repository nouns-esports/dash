import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export function createPlatform<TConnections extends Record<string, { name: string, image: string; config: z.ZodSchema }>, TTools extends Record<string, ReturnType<typeof createTool>>>(input: {
    name: string;
    image: string;
    connections: TConnections;
    tools: TTools;
    mpc?: {
        url: string;
    }
}) {
    return input
}