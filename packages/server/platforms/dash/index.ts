import { createPlatform } from "../createPlatform";
import { z } from "zod";

// Tools
import { getEvents } from "./tools/getEvents";
import { getProducts } from "./tools/getProducts";
import { getRounds } from "./tools/getRounds";
import { getRaffles } from "./tools/getRaffles";
import { purchaseVotes } from "./tools/purchaseVotes";
import { getQuests } from "./tools/getQuests";
import { getPredictions } from "./tools/getPredictions";
import { tipPoints } from "./tools/tipPoints";

// Actions
import { registerEvent } from "./actions/events/registerEvent";
import { visitLink } from "./actions/online/visitLink";
import { makePrediction } from "./actions/predictions/makePrediction";
import { castVote } from "./actions/rounds/castVote";
import { createProposal } from "./actions/rounds/createProposal";
import { linkDiscord } from "./actions/user/linkDiscord";
import { linkTwitter } from "./actions/user/linkTwitter";
import { linkFarcaster } from "./actions/user/linkFarcaster";
import { reachPercentile } from "./actions/xp/reachPercentile";
import { linkWallet } from "./actions/user/linkWallet";
import { linkEmail } from "./actions/user/linkEmail";
import { leaderboardPosition } from "./actions/xp/leaderboardPosition";
import { purchaseItem } from "./actions/shop/purchaseItem";

export const dash = createPlatform({
    name: "Dash",
    image: "",
    config: z.object({}),
    actions: {
        registerEvent,
        visitLink,
        makePrediction,
        castVote,
        createProposal,
        linkDiscord,
        linkFarcaster,
        linkTwitter,
        linkWallet,
        linkEmail,
        reachPercentile,
        leaderboardPosition,
        purchaseItem,
    },
    tools: {
        getEvents,
        getProducts,
        getRounds,
        getRaffles,
        purchaseVotes,
        getQuests,
        getPredictions,
        tipPoints,
    },
});
