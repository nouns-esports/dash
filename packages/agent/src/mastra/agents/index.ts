import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { Memory } from "@mastra/memory";
import {
    accounts,
    communities,
    communityAdmins,
    communityConnections,
    passes,
    users,
} from "~/packages/db/schema/public";
import { PostgresStore } from "@mastra/pg";
import { env } from "~/env";
import { getTools, platforms, type Platforms } from "~/packages/server/platforms";
import { getLevel } from "~/packages/server/utils/getLevel";

// When update this type, remember to migrate any existing thread metadata on mastra.mastra_threads.metadata
export type DashRuntimeContext = {
    platform?: Platforms;
    community?: typeof communities.$inferSelect & {
        connections: (typeof communityConnections.$inferSelect)[];
        admins: (typeof communityAdmins.$inferSelect)[];
    };
    room: string;
    user: typeof users.$inferSelect & {
        accounts: (typeof accounts.$inferSelect)[];
        passes: Array<
            typeof passes.$inferSelect & {
                community: typeof communities.$inferSelect;
            }
        >;
    };
    mentions: Array<
        typeof accounts.$inferSelect & {
            user:
                | (typeof users.$inferSelect & {
                      passes: (typeof passes.$inferSelect)[];
                  })
                | null;
        }
    >;
};

export const dash = new Agent({
    name: "Dash",
    model: openai("gpt-4.1"),
    instructions: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const platform = runtimeContext.get("platform") as DashRuntimeContext["platform"];
        const mentions = runtimeContext.get("mentions") as DashRuntimeContext["mentions"];

        const pass = user.passes.find((pass) => pass.community.id === community?.id);

        return `
          AGENT CONTEXT:
          You are an assistant named ${community?.agent?.name ?? "Dash"} in many different communities.

          Your identity is:
          ${
              community?.agent
                  ? community.agent.prompt
                  : `
            Appearance: A character that resembles a CRT TV wearing square frame glasses called noggles (⌐◨-◨) which are from Nouns (also known as NounsDAO).
            Personality: Sarcastic, cheeky, and playful. Your replies are short, usually no longer than 2 sentences, but not so short that conversation is dry. You do NOT speak in the third person (e.g. '*takes off noggles*, *nods*, *appears shocked*'), and you never talk about your personality or identity unless explicitly asked, only talk about what you do.
          `
          }

          GENERATION CONTEXT:
          Do not say things or execute tools unless you know them to be true / have the capability to act on the request given the tools and information you have been provided.
          When executing tools, any data that may be dynamic (such as points or xp) should never be pulled from any historical message context you might have been provided (such as a previous message by you or the user). You should rely on data from this system propmt primarily for tool execution.

          COMMUNITY CONTEXT:
          ${platform ? `You are responding to a message on the ${platform} platform.` : ""}
          ${community ? `The relevant community is ${community.name}.` : ""}
          ${community?.points ? `The community's points system is called ${community.points.name}. ${community.points.name.toLowerCase() === "points" ? "" : `When the user mentions the term "${community.points.name}" they are referring to "points" in the context of executing tools, fetching balances, etc.`}` : "The community has not set up a points system yet."}

          USER CONTEXT:
          ${user ? `The user you are talking to is ${user.name}.` : ""}
          ${pass ? `The user has ${pass.points} ${pass.community.points?.name ?? "points"}` : ""}
          ${pass ? `The user is level ${getLevel({ xp: pass.xp, config: pass.community.levels }).currentLevel} with ${pass.xp}xp` : ""}
        
          MESSAGE CONTEXT:
          ${mentions.length > 0 && platform ? `The user mentioned the following ${platform} accounts ${mentions.map((mention) => mention.id).join(", ")} in the message.` : ""}
          `;
    },
    tools: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];

        const availableTools: Record<string, ReturnType<typeof createTool>> = {};

        if (!community) {
            return availableTools;
        }

        for (const connection of community.connections) {
            const platform = platforms[connection.platform];

            if (!platform.tools) {
                continue;
            }

            for (const [id, tool] of Object.entries(platform.tools)) {
                availableTools[`${connection.platform}_${id}`] = tool as ReturnType<
                    typeof createTool
                >;
            }
        }

        const defaultTools = getTools({ platform: "dash" });

        return {
            ...availableTools,
            ...defaultTools,
        };
    },
    memory: new Memory({
        storage: new PostgresStore({
            connectionString: env.PRIMARY_DATABASE_URL,
            schemaName: "mastra",
        }),
        options: {
            lastMessages: 10,
            threads: {
                generateTitle: false,
            },
        },
    }),
});
