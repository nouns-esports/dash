import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { holdERC20 } from "./actions/holdERC20";
import { holdERC721 } from "./actions/holdERC721";
import { holdERC1155 } from "./actions/holdERC1155";

export const ethereum = createPlugin({
    name: "Ethereum",
    image: "",
    config: z
        .object({
            wallets: z
                .array(
                    z.object({
                        address: z.string().describe("The Ethereum address"),
                        chain: z.number().describe("The chain ID"),
                    }),
                )
                .describe("A list of Ethereum wallets"),
        })
        .describe("The config for the Ethereum plugin"),
    actions: {
        holdERC20,
        holdERC721,
        holdERC1155,
    },
});
