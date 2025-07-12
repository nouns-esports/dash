import { Embed } from "../components/embed";
import { z } from "zod";
import { getProducts } from "~/packages/server/platforms/dash/tools/getProducts";
import { Row } from "../components/row";
import { Button } from "../components/button";

export function ProductEmbed(props: { product: z.infer<typeof getProducts.outputSchema>[number] }) {
    return {
        embed: Embed({
            title: props.product.name,
            image: props.product.image,
            url: `https://nouns.gg/products/${props.product.id}`,
            color: "#4A5EEB",
            footer: {
                text:
                    props.product.inventory === null || props.product.inventory > 100
                        ? "In stock"
                        : props.product.inventory > 0
                          ? `${props.product.inventory} in stock`
                          : "Out of stock",
            },
        }),
        components: [
            Row([
                Button({
                    label: "Buy",
                    type: "primary",
                    disabled: true,
                    customId: `product:${props.product.id}:buy`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/products/${props.product.id}`,
                }),
            ]),
        ],
    };
}
