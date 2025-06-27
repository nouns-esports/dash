import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { lilnounsDelegate } from "./actions/lilnounsDelegate";
import { voterSnapshot } from "./actions/voterSnapshot";

export const lilnouns = createPlatform({
    name: "Lil Nouns",
    image: "",
    config: z.object({}),
    actions: {
        lilnounsDelegate,
        voterSnapshot,
    },
});
