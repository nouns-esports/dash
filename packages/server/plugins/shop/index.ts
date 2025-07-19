import { createPlugin } from "../createPlugin";
import { z } from "zod";
import { purchaseItem } from "./actions/purchaseItem";
import { getProducts } from "./tools/getProducts";

export const shop = createPlugin({
    name: "Shop",
    image: "",
    config: z.object({
        purchases: z
            .object({
                xp: z.number().describe("XP awarded per dollar spent on purchases"),
                maxXp: z
                    .number()
                    .describe("The maximum amount of XP that can be awarded per purchase"),
                points: z.number().describe("Points awarded per dollar spent on purchases"),
                maxPoints: z
                    .number()
                    .describe("The maximum amount of points that can be awarded per purchase"),
            })
            .describe("XP configuration for the shop plugin"),
        stores: z
            .object({
                shopify: z
                    .string()
                    .describe("The Shopify store ID")
                    .nullable()
                    .describe("A shopify store configuration"),
                fourthwall: z
                    .string()
                    .describe("The Fourthwall store ID")
                    .nullable()
                    .describe("A fourthwall store configuration"),
            })
            .describe("The stores that the shop plugin supports"),
    }),
    actions: {
        purchaseItem,
    },
    tools: {
        public: {
            getProducts,
        },
    },
});
