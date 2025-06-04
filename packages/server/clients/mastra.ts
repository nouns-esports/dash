import { MastraClient } from "@mastra/client-js";
import { env } from "~/env";

export const mastraClient = new MastraClient({
    baseUrl: env.NEXT_PUBLIC_ENVIRONMENT === "development" ? "http://localhost:4111" : "https://dash.nouns.gg",
});