import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export function Input(props: {
    customId: string;
    label: string;
    style: "paragraph" | "short";
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
}) {
    const input = new TextInputBuilder();

    input.setCustomId(props.customId);
    input.setLabel(props.label);
    input.setStyle(props.style === "paragraph" ? TextInputStyle.Paragraph : TextInputStyle.Short);
    input.setPlaceholder(props.placeholder ?? "");
    input.setRequired(props.required ?? false);
    input.setMaxLength(props.maxLength ?? 4000);
    input.setMinLength(props.minLength ?? 0);

    return input;
}

export function Modal(props: {
    customId: string;
    title: string;
    inputs: Array<ReturnType<typeof Input>>;
}) {
    const modal = new ModalBuilder();

    modal.setCustomId(props.customId);
    modal.setTitle(props.title);

    for (const input of props.inputs) {
        const row = new ActionRowBuilder<TextInputBuilder>();
        row.addComponents(input);
        modal.addComponents(row);
    }

    return modal;
}
