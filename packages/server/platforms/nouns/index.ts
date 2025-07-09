import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { nounsDelegate } from "./actions/nounsDelegate";

export const nouns = createPlatform({
    name: "Nouns",
    image: "",
    config: z.object({}),
    actions: {
        nounsDelegate,
    },
});
