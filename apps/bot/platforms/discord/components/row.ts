import { ActionRowBuilder } from "discord.js";
import { Button } from "./button";
import { Select } from "./select";

export function Row(components: Array<ReturnType<typeof Button> | ReturnType<typeof Select>>) {
    const row = new ActionRowBuilder();

    row.addComponents(components);

    return row;
}
