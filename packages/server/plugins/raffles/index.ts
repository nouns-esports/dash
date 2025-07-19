import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { getRaffles } from "./tools/getRaffles";

export const raffles = createPlugin({
    name: "Raffles",
    image: "",
    config: z.object({}),
    tools: {
        public: {
            getRaffles,
        },
    },
});
