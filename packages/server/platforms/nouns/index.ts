import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { nounsVoter } from "./actions/nounsVoter";

export const nouns = createPlatform({
    name: "Nouns",
    image: "",
    config: z.object({}),
    actions: {
        nounsVoter,
    },
});
