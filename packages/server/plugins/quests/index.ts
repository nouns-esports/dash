import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { getQuests } from "./tools/getQuests";

export const quests = createPlugin({
    name: "Quests",
    image: "",
    config: z.object({}),
    tools: {
        public: {
            getQuests,
        },
    },
});
