import { createPlatform } from "../createPlatform";
import { z } from "zod";
import { graduateTraits } from "./actions/graduateTraits";
import { submitTraits } from "./actions/submitTraits";

export const noundry = createPlatform({
    name: "Noundry",
    image: "",
    config: z.object({}),
    actions: {
        graduateTraits,
        submitTraits,
    },
});
