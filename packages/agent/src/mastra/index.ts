import { Mastra } from '@mastra/core';
import { dash, type DashRuntimeContext } from './agents';
import { env } from '../../../../env';
import { platforms } from '../../../platforms';
import type { RuntimeContext } from '@mastra/core/runtime-context';

export const mastra = new Mastra({
    agents: {
        dash
    },
    server: {
        middleware: [
            // Authentication
            async (c, next) => {
                if (env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
                    return next();
                }

                const authHeader = c.req.header("Authorization");

                if (!authHeader || authHeader !== `Bearer ${env.AGENT_TOKEN}`) {
                    return new Response("Unauthorized", { status: 401 });
                }

                await next();
            },
            // Runtime Context Validation
            async (c, next) => {
                const runtimeContext = c.get("runtimeContext") as RuntimeContext<DashRuntimeContext>;

                const runtimeContextHeader = c.req.header("X-Runtime-Context");

                if (runtimeContextHeader) {
                    const parsed = JSON.parse(Buffer.from(runtimeContextHeader, 'base64').toString('utf8')) as DashRuntimeContext;
                    runtimeContext.set("platform", parsed.platform);
                    runtimeContext.set("room", parsed.room);
                    runtimeContext.set("community", parsed.community);
                    runtimeContext.set("user", parsed.user);
                    runtimeContext.set("mentions", parsed.mentions);
                }


                if (env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
                    runtimeContext.set("community", {
                        id: "123",
                        name: "John Doe",
                        handle: "john-doe",
                        image: "https://i.pravatar.cc/150?u=123",
                        agent: null,
                        deprecated_description: null,
                        deprecated_parentUrl: null,
                        deprecated_details: null,
                        deprecated_featured: false,
                        connections: [],
                        boosts: 0,
                        levels: null,
                        points: null,
                    } satisfies DashRuntimeContext["community"]);

                    runtimeContext.set("platform", "discord");
                    runtimeContext.set("user", {
                        id: "123",
                        name: "John Doe",
                        image: "https://i.pravatar.cc/150?u=123",
                        privyId: "123",
                        canRecieveEmails: true,
                        deprecated_bio: null,
                        deprecated_twitter: null,
                        deprecated_discord: null,
                        deprecated_fid: null,
                        accounts: [],
                        passes: [],
                    } satisfies DashRuntimeContext["user"]);

                    runtimeContext.set("room", "123");
                    runtimeContext.set("mentions", []);
                }

                if (!runtimeContext.get("platform") || !Object.keys(platforms).includes(runtimeContext.get("platform")) || !runtimeContext.get("user")) {
                    return new Response("Bad Request", { status: 400 });
                }

                await next();
            },
        ]
    }
})        
