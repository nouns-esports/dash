import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    emptyStringAsUndefined: true,
    server: {
        // A token for verifying messages sent to the agent are valid
        AGENT_TOKEN: z.string(),
        DISCORD_CLIENT_ID: z.string(),
        DISCORD_TOKEN: z.string(),
        FARCASTER_FID: z.string(),
        MASTRA_SERVER: z.string().url(),
        NEYNAR_API_KEY: z.string(),
        OPENAI_API_KEY: z.string(),
        PGPOOL_URL: z.string(),
        PINATA_JWT: z.string(),
        PRIMARY_DATABASE_URL: z.string(),
        PRIVY_APP_SECRET: z.string(),
        PRIVY_VERIFICATION_KEY: z.string(),
        PRIVY_WEBHOOK_SIGNING_KEY: z.string(),
        TWITTER_COOKIES: z.string(),
        TWITTER_EMAIL: z.string().email(),
        TWITTER_PASSWORD: z.string(),
        TWITTER_USERNAME: z.string(),
    },
    client: {
        NEXT_PUBLIC_DOMAIN: z.string().url(),
        NEXT_PUBLIC_ENVIRONMENT: z.enum(["dev", "prod"]),
        NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
        NEXT_PUBLIC_POSTHOG_KEY: z.string(),
        NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    },
});

