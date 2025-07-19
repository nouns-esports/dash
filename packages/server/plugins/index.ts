import { discord } from "./discord";
import { farcaster } from "./farcaster";
import { dash } from "./dash";
import { rounds } from "./rounds";
import { shop } from "./shop";
import { events } from "./events";
import { quests } from "./quests";
import { raffles } from "./raffles";
import { predictions } from "./predictions";
import { noundry } from "./noundry";
import { nouns } from "./nouns";
import { lilnouns } from "./lilnouns";
import { ethereum } from "./ethereum";

export const plugins = {
    dash,
    discord,
    farcaster,
    rounds,
    shop,
    events,
    quests,
    raffles,
    predictions,
    noundry,
    nouns,
    lilnouns,
    ethereum,
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
