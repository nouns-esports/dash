import { discord } from "./discord";
import { farcaster } from "./farcaster";
import { dash } from "./dash";

export const plugins = {
    dash,
    discord,
    farcaster,
} as const;

export type Plugins = keyof typeof plugins;

export function getAction(input: { action: string; plugin: Plugins }) {
    const platform = plugins[input.plugin];

    return platform.actions?.[input.action];
}

export function getActions(input: { plugin: Plugins }) {
    const platform = plugins[input.plugin];

    return platform.actions;
}

export function getTool(input: {
    tool: string;
    plugin: Plugins;
    type: "public" | "admin" | "owner";
}) {
    const platform = plugins[input.plugin];

    return platform.tools?.[input.type]?.[input.tool];
}

export function getTools(input: { plugin: Plugins; type: "public" | "admin" | "owner" }) {
    const platform = plugins[input.plugin];

    return platform.tools?.[input.type];
}
