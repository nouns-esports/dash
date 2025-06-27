import { Embed } from "../components/embed";
import { z } from "zod";
import { getEvents } from "~/packages/server/tools/getEvents";

export function EventEmbed(props: {
    event: z.infer<typeof getEvents.outputSchema>[number];
}) {
    return Embed({
        title: props.event.name,
        image: props.event.image,
        url: `https://nouns.gg/events/${props.event.id}`,
        color: "#4A5EEB",
        footer: props.event.attendeeCount
            ? {
                  text: `${props.event.attendeeCount} attendees`,
              }
            : undefined,
    });
}
