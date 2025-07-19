import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { makePrediction } from "./actions/makePrediction";
import { getPredictions } from "./tools/getPredictions";

export const predictions = createPlugin({
    name: "Predictions",
    image: "",
    config: z.object({}),
    actions: {
        makePrediction,
    },
    tools: {
        public: {
            getPredictions,
        },
    },
});
