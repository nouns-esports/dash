import { env } from "~/env";
import { Embed } from "../components/embed";

export function QuestEmbed(props: {
    quest: {
        id: string;
        name: string;
        description: string;
        image: string;
        xp: number;
        points: number;
        pointsLabel: string;
    };
}) {
    return Embed({
        title: props.quest.name,
        description: `Earns **${props.quest.xp}xp**${props.quest.points > 0 ? ` and **${props.quest.points} ${props.quest.pointsLabel}**` : ""}`,
        image: `${props.quest.image}?img-width=1200&img-height=800&img-fit=cover&img-onerror=redirect`,
        url: `https://nouns.gg/quests/${props.quest.id}`,
    });
}
