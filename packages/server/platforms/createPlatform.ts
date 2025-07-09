import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { createAction } from "./createAction";

export function createPlatform(input: {
    name: string;
    image: string;
    config: z.AnyZodObject;
    tools?: Record<string, ReturnType<typeof createTool>>;
    actions?: Record<string, ReturnType<typeof createAction<any>>>;
}) {
    return input;
}
