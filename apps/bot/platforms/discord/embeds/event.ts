import { Embed } from "../components/embed";
import { z } from "zod";
import { getEvents } from "~/packages/server/platforms/dash/tools/getEvents";
import { Row } from "../components/row";
import { Button } from "../components/button";
import { optimizeImage } from "~/packages/server/utils/optimizeImage";

export function EventEmbed(props: {
    event: z.infer<typeof getEvents.outputSchema>[number];
}) {
    return {
        embed: Embed({
            title: props.event.name,
            image: optimizeImage(props.event.image, {
                width: 1200,
                height: 675,
            }),
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
