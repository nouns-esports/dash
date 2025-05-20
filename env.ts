import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    runtimeEnv: process.env,
    clientPrefix: "PUBLIC_",
    emptyStringAsUndefined: true,
    client: {
    },
    server: {
        DISCORD_TOKEN: z.string().min(1),
        PRIMARY_DATABASE_URL: z.string().min(1),
        PGPOOL_URL: z.string().min(1),
        OPENAI_API_KEY: z.string().min(1),
    },
});