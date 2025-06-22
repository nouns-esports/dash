import { ButtonBuilder, ButtonStyle } from "discord.js";

export function Button(
    props: {
        label: string;
        emoji?: string | { id: string; name: string };
        disabled?: boolean;
    } & (
        | {
              type: "link";
              url: string;
          }
        | { type: "primary" | "secondary" | "success" | "danger"; customId: string }
    ),
) {
    const button = new ButtonBuilder();

    button.setLabel(props.label);
    button.setDisabled(props.disabled ?? false);

    const style = {
        primary: ButtonStyle.Primary,
        secondary: ButtonStyle.Secondary,
        success: ButtonStyle.Success,
        danger: ButtonStyle.Danger,
        link: ButtonStyle.Link,
    }[props.type];

    button.setStyle(style);

    if (props.emoji) {
        button.setEmoji(props.emoji);
    }

    if (props.type === "link") {
        button.setURL(props.url);
    } else {
        button.setCustomId(props.customId);
    }

    return button;
}
