import { discord } from "./discord";
import { farcaster } from "./farcaster";

export const platforms = {
    discord,
    farcaster,
} as const;

export type Platforms = keyof typeof platforms;
