import { Mastra } from '@mastra/core';
import { dash, type DashRuntimeContext } from './agents';
import { env } from '~/env';
import { platformTypes } from '~/packages/platforms';

export const mastra = new Mastra({
    agents: {
        dash
    },
    server: {
        middleware: [
            // Authentication
            async (c, next) => {
                const authHeader = c.req.header("Authorization");

                if (!authHeader || authHeader !== `Bearer ${env.AGENT_TOKEN}`) {
                    return new Response("Unauthorized", { status: 401 });
                }

                await next();
            },
            // Runtime Context Validation
            async (c, next) => {
                const runtimeContext = c.get("runtimeContext") as DashRuntimeContext

                if (!runtimeContext.platform || !platformTypes.includes(runtimeContext.platform) || !runtimeContext.user) {
                    return new Response("Bad Request", { status: 400 });
                }

                await next();
            },
        ]
    }
})        
