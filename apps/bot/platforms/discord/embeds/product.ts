import { Embed } from "../components/embed";
import { z } from "zod";
import { getProducts } from "~/packages/server/plugins/shop/tools/getProducts";
import { Row } from "../components/row";
import { Button } from "../components/button";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function ProductEmbed(props: { product: z.infer<typeof getProducts.outputSchema>[number] }) {
    return {
        embed: Embed({
            title: props.product.name,
            image: optimizeImage(props.product.image, {
                width: 1200,
                height: 675,
            }),
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
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/products/${props.product.id}`,
                }),
            ]),
        ],
    };
}
