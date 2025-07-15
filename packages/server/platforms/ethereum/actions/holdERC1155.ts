import { createAction } from "~/packages/server/platforms/createAction";
import { z } from "zod";
import { supportedChains, viemClient } from "~/packages/server/clients/viem";
import { parseAbiItem } from "viem";
import { privyClient } from "~/packages/server/clients/privy";

export const holdERC1155 = createAction({
    name: "Hold ERC1155",
    schema: z.object({
        address: z.string().describe("The Ethereum address"),
        chain: z
            .enum(Object.keys(supportedChains) as [string, ...string[]])
            .describe("The chain ID"),
        tokenId: z.number().describe("The token ID"),
        minBalance: z.number().describe("The minimum balance of the token"),
        block: z.number().nullable().describe("The block number to check from"),
    }),
    check: async ({ input, user }) => {
        const privyUser = await privyClient.getUserById(user.privyId);

        if (!privyUser) return false;

        const wallets = privyUser.linkedAccounts.filter((account) => account.type === "wallet");

        const client = viemClient(input.chain as keyof typeof supportedChains);

        for (const wallet of wallets) {
            const balance = await client.readContract({
                address: input.address as `0x${string}`,
                abi: [
                    parseAbiItem(
                        "function balanceOf(address owner, uint256 id) view returns (uint256)",
                    ),
                ],
                functionName: "balanceOf",
                blockNumber: input.block ? BigInt(input.block) : undefined,
                args: [wallet.address as `0x${string}`, BigInt(input.tokenId)],
            });

            if (balance >= input.minBalance) {
                return true;
            }
        }

        return false;
    },
});
