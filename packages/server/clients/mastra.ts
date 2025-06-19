import { MastraClient } from "@mastra/client-js";
import { env } from "~/env";

export const mastraClient = new MastraClient({
    baseUrl: env.MASTRA_SERVER,
    // headers: {
    //     "Authorization": `Bearer ${env.AGENT_TOKEN}`
    // }
});