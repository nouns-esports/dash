import { Embed } from "../components/embed";
import { z } from "zod";
import { getPredictions } from "~/packages/server/plugins/predictions/tools/getPredictions";
import { Row } from "../components/row";
import { Button } from "../components/button";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function PredictionEmbed(props: {
    prediction: z.infer<typeof getPredictions.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.prediction.name,
            image: optimizeImage(props.prediction.image, {
                width: 1200,
                height: 675,
            }),
            url: `https://nouns.gg/predictions/${props.prediction.id}`,
            color: "#4A5EEB",
            footer: {
                text: `Earns up to ${props.prediction.xp.winning + props.prediction.xp.predicting}xp`,
            },
        }),
        components: [
            Row([
                Button({
                    label: "Predict",
                    type: "primary",
                    customId: `prediction:${props.prediction.id}:predict`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/predictions/${props.prediction.id}`,
                }),
            ]),
        ],
    };
}
