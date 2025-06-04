import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { Memory } from "@mastra/memory";
import { accounts, communities, communityConnections, passes, users } from "~/packages/db/schema/public";
import { PostgresStore } from "@mastra/pg";
import { env } from "~/env";
import { platforms, type Platforms } from "~/packages/platforms";

// Internal Tools
import { fetchPass } from "../tools/fetchPass";
import { tipPoints } from "../tools/tipPoints";

export type DashRuntimeContext = {
    platform: Platforms;
    community?: typeof communities.$inferSelect & {
        connections: typeof communityConnections.$inferSelect[];
    };
    room: string;
    user: typeof users.$inferSelect & {
        accounts: typeof accounts.$inferSelect[];
        passes: typeof passes.$inferSelect[];
    };
    mentions?: Array<typeof accounts.$inferSelect & {
        pass: typeof passes.$inferSelect;
        user: typeof users.$inferSelect | null;
    }>;
}

export const memory = new Memory({
    storage: new PostgresStore({
        connectionString: env.PRIMARY_DATABASE_URL,
        schemaName: "mastra"
    }),
    // options: {
    //     threads: {
    //         generateTitle: true,
    //     }
    // }
})

export const dash = new Agent({
    name: "Dash",
    // TODO: Use Gemini 2.5 Flash
    model: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        if (community?.tier === 0) {
            return openai("gpt-4o");
        }

        return openai("gpt-4o");
    },
    instructions: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const platform = runtimeContext.get("platform") as DashRuntimeContext["platform"];
        const mentions = runtimeContext.get("mentions") as DashRuntimeContext["mentions"];

        return `
          You are an agent named ${community?.agent?.name ?? "Dash"} that helps level up communities.

          Your identity is:
          ${community?.agent ? community.agent.prompt : `
            Appearance: A human like figure with a CRT TV head wearing square frame glasses called noggles (⌐◨-◨) which are from Nouns (also known as NounsDAO).
            Personality: Sarcastic, cheeky, and playful. You do NOT speak in the third person (e.g. '*takes off noggles*, *nods*, *appears shocked*'). Your replies are short, usually no longer than 2 sentences, but not so short that conversation is dry.
          `}
 
          You are responding to a message on ${platform}.
          ${community ? `The community you are in right now is ${community.name}.` : ""}

          ${community?.points ? `The community's points system is called ${community.points.name}.` : ""}

          ${user ? `The user you are talking to is ${user.name}.` : ""}
          ${mentions ? `The user mentioned the following ${platform} accounts ${mentions.map((mention) => mention.id).join(", ")} in the message.` : ""}
        `
    },
    tools: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        const availableTools: Record<string, ReturnType<typeof createTool>> = {
            fetchPass,
            tipPoints,
        }

        if (!community) {
            return availableTools
        }

        for (const connection of community.connections) {
            const platform = platforms[connection.platform]

            for (const [id, tool] of Object.entries(platform.tools)) {
                availableTools[id] = tool as ReturnType<typeof createTool>
            }
        }

        return availableTools
    },
    memory
})