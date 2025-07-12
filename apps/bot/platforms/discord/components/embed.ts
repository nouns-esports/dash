import { EmbedBuilder, type HexColorString } from "discord.js";

export function Embed(props: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    color?: HexColorString;
    footer?: {
        text: string;
        icon?: string;
    };
}) {
    const embed = new EmbedBuilder();

    if (props.title) embed.setTitle(props.title);
    if (props.description) embed.setDescription(props.description);
    if (props.image) embed.setImage(props.image);
    if (props.url) embed.setURL(props.url);
    if (props.color) embed.setColor(props.color);
    if (props.footer) embed.setFooter({ text: props.footer.text, iconURL: props.footer.icon });

    return embed;
}
