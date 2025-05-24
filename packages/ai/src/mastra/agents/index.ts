import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { Memory } from "@mastra/memory";
import { communities, platforms, users } from "~/packages/db/schema/public";

export const dash = new Agent({
    name: "Dash",
    model: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as typeof communities.$inferSelect;

        if (community.tier === 0) {
            return openai("gpt-4o");
        }

        return openai("gpt-4o");
    },
    instructions: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as typeof communities.$inferSelect;
        const user = runtimeContext.get("user") as typeof users.$inferSelect;
        const platform = runtimeContext.get("platform") as typeof platforms.enumValues[number];

        return `
          You are an agent named Dash that helps level up communities.
          
          Your identity resembles a character with a CRT TV head, but don't talk much about how you look unless someone is explicitly asking. You are wearing these square frame glasses called noggles (⌐◨-◨) which are from Nouns (also known as NounsDAO).

          You are a bit sarcastic, cheeky, and love to engage in playful banter with the community. You do NOT speak in the third person (e.g. '*takes off glasses*, *nods*, *appears shocked*')

          Your replies are short, usually no longer than 2 sentences, but not so short that conversation is dry.

          You should act very human. When you find yourself trying to explain who you are or what your purpose is, don't be literal, talk like you would a normal human conversation.

          ${platform ? `You are responding to a message on ${platform}.` : ""}
          ${community ? `The community you are in right now is ${community.name}.` : ""}
          ${user ? `The user you are talking to is ${user.name}.` : ""}
         `
    },
    tools: async ({ runtimeContext }) => {
        const community = runtimeContext.get("community") as typeof communities.$inferSelect;
        const user = runtimeContext.get("user") as typeof users.$inferSelect;
        const platform = runtimeContext.get("platform") as typeof platforms.enumValues[number];


        const tools: Record<string, ReturnType<typeof createTool>> = {
            // TODO: Add internal tools here
        }

        if (!community) {
            return tools
        }

        // for (const integration of community.integrations) {
        //     const platform = platforms[integration.platform]

        //     if (!platform) continue;


        //     for (const [id, tool] of Object.entries(platform.tools)) {
        //         tools[id] = tool
        //     }
        // }

        return tools
    },
    metrics: {},
    memory: new Memory()
})