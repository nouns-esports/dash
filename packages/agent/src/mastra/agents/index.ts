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
import { platforms, type Platforms } from "~/packages/platforms";

// Internal Tools
import { tipPoints } from "~/packages/server/tools/tipPoints";
import { getLevel } from "~/packages/server/utils/getLevel";
import { getQuests } from "~/packages/server/tools/getQuests";
import { getPredictions } from "~/packages/server/tools/getPredictions";

// When update this type, remember to migrate any existing thread metadata on mastra.mastra_threads.metadata
export type DashRuntimeContext = {
    platform?: Platforms;
    community?: typeof communities.$inferSelect & {
        connections: (typeof communityConnections.$inferSelect)[];
        admins: (typeof communityAdmins.$inferSelect)[];
        boosts: number;
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

export const memory = new Memory({
    storage: new PostgresStore({
        connectionString: env.PRIMARY_DATABASE_URL,
        schemaName: "mastra",
    }),
    options: {
        threads: {
            generateTitle: false,
        },
    },
});

export const dash = new Agent({
    name: "Dash",
    model: openai("gpt-4.1"),
    instructions: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as DashRuntimeContext["community"];
        const user = runtimeContext.get("user") as DashRuntimeContext["user"];
        const platform = runtimeContext.get("platform") as DashRuntimeContext["platform"];
        const mentions = runtimeContext.get("mentions") as DashRuntimeContext["mentions"];

        console.log("INSTRUCTIONS");
        console.log(
            "mentions",
            mentions.map((mention) => mention.id),
        );
        console.log("user", user.name);
        console.log("community", community?.handle);

        const boostedCommunities = user.passes.filter((pass) => pass.boosts > 0);

        return `
          AGENT CONTEXT:
          You are an assistant named ${community?.agent?.name ?? "Dash"} in many different communities.

          Your identity is:
          ${
              community?.agent
                  ? community.agent.prompt
                  : `
            Appearance: A character with a CRT TV head wearing square frame glasses called noggles (⌐◨-◨) which are from Nouns (also known as NounsDAO).
            Personality: Sarcastic, cheeky, and playful. Your replies are short, usually no longer than 2 sentences, but not so short that conversation is dry. You do NOT speak in the third person (e.g. '*takes off noggles*, *nods*, *appears shocked*'), and you never talk about your personality or identity unless explicitly asked, only talk about what you do.
          `
          }

          Do not say things unless you know them to be true / have the capability to act on the request given the tools and information you have been provided.
 
          COMMUNITY CONTEXT:
          ${platform ? `You are responding to a message on the ${platform} platform.` : ""}
          ${community ? `The relevant community is ${community.name}.` : ""}
          ${community?.points ? `The community's points system is called ${community.points.name}. ${community.points.name.toLowerCase() === "points" ? "" : `When the user mentions the term "${community.points.name}" they are referring to "points" in the context of executing tools, fetching balances, etc.`}` : "The community has not set up a points system yet."}

          USER CONTEXT:
          ${user ? `The user you are talking to is ${user.name}.` : ""}
          ${user.passes.length > 0 ? `The user is a member of the following communities: ${user.passes.map((pass) => pass.community.name).join(", ")}.` : "The user is not a member of any communities."}
          ${user.passes.length > 0 ? `The user has the following balances in each community: ${user.passes.map((pass) => `\n${pass.community.name}: ${pass.points} ${pass.community.points?.name ?? "points"}`).join(", ")}.` : ""}
          ${
              boostedCommunities.length > 0
                  ? `The user has boosted the following communities: ${boostedCommunities
                        .map((pass) => `\n${pass.community.name}: ${pass.boosts} boosts`)
                        .join(", ")}.`
                  : ""
          }
          ${user.passes.length > 0 ? `The user has the following xp levels in each community: ${user.passes.map((pass) => `\n${pass.community.name}: ${pass.xp} xp / level ${getLevel({ xp: pass.xp, config: pass.community.levels }).currentLevel}`).join(", ")}.` : ""}
        
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
                availableTools[id] = tool as ReturnType<typeof createTool>;
            }
        }

        return { ...availableTools, tipPoints, getQuests, getPredictions };
    },
    memory,
});
