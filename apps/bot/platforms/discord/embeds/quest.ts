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
        description: `Earns **${props.quest.xp}xp** and **${props.quest.points} ${props.quest.pointsLabel}**`,
        image: props.quest.image,
        url: `https://nouns.gg/quests/${props.quest.id}`,
    });
}
