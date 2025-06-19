import { MastraClient } from "@mastra/client-js";
import { env } from "~/env";
import type { DashRuntimeContext } from "~/packages/agent/src/mastra/agents";

export const mastraClient = (runtimeContext: DashRuntimeContext) => new MastraClient({
    baseUrl: env.MASTRA_SERVER,
    headers: {
        "Authorization": `Bearer ${env.AGENT_TOKEN}`,
        "X-Runtime-Context": JSON.stringify(runtimeContext)
    }
});