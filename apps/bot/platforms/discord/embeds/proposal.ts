import { Embed } from "../components/embed";
import { getProposals } from "~/packages/server/platforms/dash/tools/getProposals";
import { z } from "zod";
import { Button } from "../components/button";
import { Row } from "../components/row";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function ProposalEmbed(props: {
    proposal: z.infer<typeof getProposals.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.proposal.title,
            image: optimizeImage(props.proposal.image ?? props.proposal.round.image, {
                width: 1200,
                height: 675,
            }),
            url: `https://nouns.gg/rounds/${props.proposal.round.id}?proposal=${props.proposal.id}`,
            color: "#4A5EEB",
            footer: {
                text: props.proposal.author.name,
                icon: props.proposal.author.image,
            },
        }),
        components: [
            Row([
                Button({
                    label: "Vote",
                    type: "primary",
                    disabled: true,
                    customId: `proposal:${props.proposal.id}:vote`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/rounds/${props.proposal.round.id}?proposal=${props.proposal.id}`,
                }),
            ]),
        ],
    };
}
