import { env } from "~/env";
import { Embed } from "../components/embed";
import { z } from "zod";
import { getPredictions } from "~/packages/agent/src/mastra/tools/getPredictions";

export function PredictionEmbed(props: {
    prediction: z.infer<typeof getPredictions.outputSchema>[number];
}) {
    return Embed({
        title: props.prediction.name,
        image: props.prediction.image,
        url: `https://nouns.gg/predictions/${props.prediction.id}`,
        footer: {
            text: `Earns **${props.prediction.xp}xp**`,
        },
    });
}
