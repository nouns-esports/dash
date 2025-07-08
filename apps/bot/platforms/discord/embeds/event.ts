import { Embed } from "../components/embed";
import { z } from "zod";
import { getEvents } from "~/packages/server/tools/getEvents";
import { Row } from "../components/row";
import { Button } from "../components/button";

export function EventEmbed(props: {
    event: z.infer<typeof getEvents.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.event.name,
            image: props.event.image,
            url: `https://nouns.gg/events/${props.event.id}`,
            color: "#4A5EEB",
            footer: props.event.attendeeCount
                ? {
                      text: `${props.event.attendeeCount} attendees`,
                  }
                : undefined,
        }),
        components: [
            Row([
                Button({
                    label: "Register",
                    type: "primary",
                    disabled: true,
                    customId: `event:${props.event.id}:register`,
                }),
                Button({
                    label: "View",
                    type: "link",
                    url: `https://nouns.gg/events/${props.event.id}`,
                }),
            ]),
        ],
    };
}
