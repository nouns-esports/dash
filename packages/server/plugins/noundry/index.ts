import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { graduateTraits } from "./actions/graduateTraits";
import { submitTraits } from "./actions/submitTraits";

export const noundry = createPlugin({
    name: "Noundry",
    image: "",
    config: z.object({}),
    actions: {
        graduateTraits,
        submitTraits,
    },
});
