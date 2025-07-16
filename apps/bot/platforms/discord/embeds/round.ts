import { Embed } from "../components/embed";
import { getRounds } from "~/packages/server/platforms/dash/tools/getRounds";
import { z } from "zod";
import { Button } from "../components/button";
import { Row } from "../components/row";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function RoundEmbed(props: {
    round: z.infer<typeof getRounds.outputSchema>[number];
}) {
    const now = new Date();

    const isVoting = now > new Date(props.round.votingStart) && now < new Date(props.round.end);
    const isProposing =
        now > new Date(props.round.start) && now < new Date(props.round.votingStart);

    return {
        embed: Embed({
            title: props.round.name,
            image: optimizeImage(props.round.image, {
                width: 1200,
                height: 675,
            }),
            url: `https://nouns.gg/rounds/${props.round.id}`,
            color: "#4A5EEB",
        }),
        components:
            isVoting || isProposing
                ? [
                      Row([
                          Button({
                              label: isVoting ? "Vote" : "Propose",
                              type: "primary",
                              disabled: true,
                              customId: `round:${props.round.id}:${isVoting ? "vote" : "propose"}`,
                          }),
                          Button({
                              label: "View",
                              type: "link",
                              url: `https://nouns.gg/rounds/${props.round.id}`,
                          }),
                      ]),
                  ]
                : [],
    };
}
