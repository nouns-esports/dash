import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { registerEvent } from "./actions/registerEvent";
import { getEvents } from "./tools/getEvents";

export const events = createPlugin({
    name: "Events",
    image: "",
    config: z.object({}),
    actions: {
        registerEvent,
    },
    tools: {
        public: {
            getEvents,
        },
    },
});
