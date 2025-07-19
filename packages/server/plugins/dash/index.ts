import { createPlugin } from "../createPlugin";
import { z } from "zod";

// Tools
import { getProducts } from "../shop/tools/getProducts";
import { tipPoints } from "./tools/tipPoints";
import { issuePoints } from "./tools/issuePoints";

// Actions
// import { registerEvent } from "./actions/events/registerEvent";
// import { makePrediction } from "./actions/predictions/makePrediction";
// import { castVote } from "./actions/rounds/castVote";
// import { createProposal } from "./actions/rounds/createProposal";
import { linkDiscord } from "./actions/linkDiscord";
import { linkTwitter } from "./actions/linkTwitter";
import { linkFarcaster } from "./actions/linkFarcaster";
import { reachPercentile } from "./actions/reachPercentile";
import { linkWallet } from "./actions/linkWallet";
import { linkEmail } from "./actions/linkEmail";
import { leaderboardPosition } from "./actions/leaderboardPosition";
import { purchaseItem } from "../shop/actions/purchaseItem";
import { visitLink } from "./actions/visitLink";

export const dash = createPlugin({
    name: "Dash",
    image: "",
    config: z.object({}),
    actions: {
        // registerEvent,
        visitLink,
        // makePrediction,
        // castVote,
        // createProposal,
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
        public: {
            getProducts,
            tipPoints,
        },
        admin: {
            issuePoints,
        },
    },
});
