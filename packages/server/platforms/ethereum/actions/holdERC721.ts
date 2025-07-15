import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";
import { supportedChains, viemClient } from "~/packages/server/clients/viem";
import { parseAbiItem } from "viem";

export const holdERC721 = createAction({
    name: "Hold ERC721",
    schema: z.object({
        address: z.string().describe("The Ethereum address"),
        chain: z
            .enum(Object.keys(supportedChains) as [string, ...string[]])
            .describe("The chain ID"),
        minBalance: z.number().describe("The minimum balance of the token"),
        block: z.number().nullable().describe("The block number to check from"),
    }),
    check: async ({ input }) => {
        const client = viemClient(input.chain as keyof typeof supportedChains);

        const balance = await client.readContract({
            address: input.address as `0x${string}`,
            abi: [parseAbiItem("function balanceOf(address owner) view returns (uint256)")],
            functionName: "balanceOf",
            blockNumber: input.block ? BigInt(input.block) : undefined,
            args: [input.address as `0x${string}`],
        });

        if (balance >= input.minBalance) {
            return true;
        }

        return false;
    },
});
