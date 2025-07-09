import { discord } from "./discord";
import { farcaster } from "./farcaster";
import { dash } from "./dash";

export const platforms = {
    dash,
    discord,
    farcaster,
} as const;

export type Platforms = keyof typeof platforms;

export function getAction(input: { action: string; platform: Platforms }) {
    const platform = platforms[input.platform];

    return platform.actions?.[input.action];
}

export function getActions(input: { platform: Platforms }) {
    const platform = platforms[input.platform];

    return platform.actions;
}

export function getTool(input: { tool: string; platform: Platforms }) {
    const platform = platforms[input.platform];

    return platform.tools?.[input.tool];
}

export function getTools(input: { platform: Platforms }) {
    const platform = platforms[input.platform];

    return platform.tools;
}
