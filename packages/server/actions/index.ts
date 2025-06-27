import { makePrediction } from "./predictions/makePrediction";
import { castVote } from "./rounds/castVote";
import { createProposal } from "./rounds/createProposal";
import { registerEvent } from "./events/registerEvent";
import { visitLink } from "./online/visitLink";
import { linkDiscord } from "./user/linkDiscord";
import { linkFarcaster } from "./user/linkFarcaster";
import { linkTwitter } from "./user/linkTwitter";
import { reachPercentile } from "./xp/reachPercentile";
import type { createAction } from "./createAction";
import { platforms, type Platforms } from "~/packages/platforms";

const internalActions: Record<string, ReturnType<typeof createAction<any>>> = {
    registerEvent,
    visitLink,
    makePrediction,
    castVote,
    createProposal,
    linkDiscord,
    linkFarcaster,
    linkTwitter,
    reachPercentile,
};

export function getAction(input: { action: string; platform: Platforms | null }) {
    if (input.platform === null) {
        return internalActions[input.action];
    }

    const platform = platforms[input.platform];

    return platform?.actions?.[input.action];
}
