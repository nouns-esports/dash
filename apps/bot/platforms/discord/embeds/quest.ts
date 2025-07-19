import { Embed } from "../components/embed";
import { getQuests } from "~/packages/server/plugins/quests/tools/getQuests";
import { z } from "zod";
import { Row } from "../components/row";
import { Button } from "../components/button";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function QuestEmbed(props: {
    quest: z.infer<typeof getQuests.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.quest.name,
            image: optimizeImage(props.quest.image, {
                width: 1200,
                height: 800,
                fit: "cover",
            }),
            url: `https://nouns.gg/quests/${props.quest.id}`,
            color: "#4A5EEB",
            footer: {
                text: `Earns ${props.quest.xp}xp ${props.quest.points > 0 ? `and ${props.quest.points} ${props.quest.pointsLabel}` : ""}`,
            },
        }),
        components: [
            Row([
                Button({
                    label: "Check",
                    type: "primary",
                    customId: `quest:${props.quest.id}:check`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/quests/${props.quest.id}`,
                }),
            ]),
        ],
    };
}
