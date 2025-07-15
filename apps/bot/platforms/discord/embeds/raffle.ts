import { Embed } from "../components/embed";
import { getRaffles } from "~/packages/server/platforms/dash/tools/getRaffles";
import { z } from "zod";
import { Row } from "../components/row";
import { Button } from "../components/button";

export function RaffleEmbed(props: {
    raffle: z.infer<typeof getRaffles.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.raffle.name,
            image: `${props.raffle.image}?img-width=1200&img-height=800&img-fit=cover&img-onerror=redirect`,
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
                    disabled: true,
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
