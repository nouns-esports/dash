import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { lilnounsVoter } from "./actions/lilnounsVoter";

export const lilnouns = createPlugin({
    name: "Lil Nouns",
    image: "",
    config: z.object({}),
    actions: {
        lilnounsVoter,
    },
});
