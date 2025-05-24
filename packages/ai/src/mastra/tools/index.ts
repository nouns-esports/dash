import type { createTool } from "@mastra/core/tools";
import type { platforms } from "~/packages/db/schema/public";

// Discord
import { hasRole } from "./discord/hasRole";

// Internal
import { fetchPass } from "./internal/fetchPass";
import { tipPoints } from "./internal/tipPoints";

export const tools: Record<"internal" | typeof platforms.enumValues[number], Record<string, ReturnType<typeof createTool>>> = {
    internal: {
        fetchPass,
        tipPoints,
    },
    discord: {
        hasRole,
    },
    twitter: {
    },
    farcaster: {
    },
}