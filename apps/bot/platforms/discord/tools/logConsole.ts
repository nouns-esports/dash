import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const logConsole = createTool({
      id: 'log-console',
      description: 'Log a message to the console',
      inputSchema: z.object({
        message: z.string(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
      }),
      execute: async ({ context }) => {
        console.log(context.message);

        return { success: true };
    },
});
