import { Embed } from "../components/embed";
import { z } from "zod";
import { getPredictions } from "~/packages/server/platforms/dash/tools/getPredictions";
import { Row } from "../components/row";
import { Button } from "../components/button";

export function PredictionEmbed(props: {
    prediction: z.infer<typeof getPredictions.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.prediction.name,
            image: props.prediction.image,
            url: `https://nouns.gg/predictions/${props.prediction.id}`,
            color: "#4A5EEB",
            footer: {
                text: `Earns ${props.prediction.xp}xp`,
            },
        }),
        components: [
            Row([
                Button({
                    label: "Predict",
                    type: "primary",
                    disabled: true,
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
