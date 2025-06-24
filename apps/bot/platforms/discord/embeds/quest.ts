import { env } from "~/env";
import { Embed } from "../components/embed";
import { getQuests } from "~/packages/agent/src/mastra/tools/getQuests";
import { z } from "zod";

export function QuestEmbed(props: {
    quest: z.infer<typeof getQuests.outputSchema>[number];
}) {
    return Embed({
        title: props.quest.name,
        image: `${props.quest.image}?img-width=1200&img-height=800&img-fit=cover&img-onerror=redirect`,
        url: `https://nouns.gg/quests/${props.quest.id}`,
        footer: {
            text: `Earns **${props.quest.xp}xp**${props.quest.points > 0 ? ` and **${props.quest.points} ${props.quest.pointsLabel}**` : ""}`,
        },
    });
}
