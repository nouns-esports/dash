import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { nounsVoter } from "./actions/nounsVoter";

export const nouns = createPlugin({
    name: "Nouns",
    image: "",
    config: z.object({}),
    actions: {
        nounsVoter,
    },
});
