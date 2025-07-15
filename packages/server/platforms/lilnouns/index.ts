import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { lilnounsVoter } from "./actions/lilnounsVoter";

export const lilnouns = createPlatform({
    name: "Lil Nouns",
    image: "",
    config: z.object({}),
    actions: {
        lilnounsVoter,
    },
});
