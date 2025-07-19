import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { getRounds } from "./tools/getRounds";
import { castVote } from "./actions/castVote";
import { createProposal } from "./actions/createProposal";
import { purchaseVotes } from "./tools/purchaseVotes";
import { getProposals } from "./tools/getProposals";

export const rounds = createPlugin({
    name: "Rounds",
    image: "",
    config: z.object({}),
    actions: {
        castVote,
        createProposal,
    },
    tools: {
        public: {
            getRounds,
            purchaseVotes,
            getProposals,
        },
    },
});
