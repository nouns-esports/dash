import { StringSelectMenuBuilder } from "discord.js";

export function Select(props: {
    customId: string;
    placeholder: string;
    options: { label: string; value: string; emoji?: string | { id: string; name: string }; }[];
    disabled?: boolean;
    minValues?: number;
    maxValues?: number;
}) {
    const select = new StringSelectMenuBuilder();

    select.setCustomId(props.customId)
    select.setPlaceholder(props.placeholder)
    select.setMinValues(props.minValues ?? 1)
    select.setMaxValues(props.maxValues ?? 1)
    select.setDisabled(props.disabled ?? false)
    select.addOptions(props.options);

    return select;
}