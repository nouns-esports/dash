import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { createAction } from "./createAction";

export function createPlugin(input: {
    name: string;
    image: string;
    config: z.AnyZodObject;
    tools?: {
        public?: Record<string, ReturnType<typeof createTool>>;
        admin?: Record<string, ReturnType<typeof createTool>>;
        owner?: Record<string, ReturnType<typeof createTool>>;
    };
    actions?: Record<string, ReturnType<typeof createAction<any>>>;
}) {
    return input;
}
