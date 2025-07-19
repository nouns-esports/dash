import { Embed } from "../components/embed";
import { getRaffles } from "~/packages/server/plugins/raffles/tools/getRaffles";
import { z } from "zod";
import { Row } from "../components/row";
import { Button } from "../components/button";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function RaffleEmbed(props: {
    raffle: z.infer<typeof getRaffles.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.raffle.name,
            image: optimizeImage(props.raffle.image, {
                width: 1200,
                height: 800,
                fit: "cover",
            }),
            url: `https://nouns.gg/raffles/${props.raffle.id}`,
            color: "#4A5EEB",
            footer: {
                text: `${props.raffle.winners} winner${props.raffle.winners === 1 ? "" : "s"}`,
            },
        }),
        components: [
            Row([
                Button({
                    label: "Enter",
                    type: "primary",
                    customId: `raffle:${props.raffle.id}:enter`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/raffles/${props.raffle.id}`,
                }),
            ]),
        ],
    };
}
