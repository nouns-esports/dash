import { z } from "zod";
import type { User } from "../queries/getUser";
import type { Community } from "../mutations/createCommunity";

export function createAction<TSchema extends z.AnyZodObject = z.AnyZodObject>(action: {
    name: string;
    schema: TSchema;
    check: (props: {
        input: z.infer<TSchema>;
        user: User;
        community: Community;
    }) => Promise<boolean>;
}) {
    return {
        name: action.name,
        check: async (props: {
            input: z.infer<TSchema>;
            user: User;
            community: Community;
        }) => {
            console.log("INPUT", props.input);
            const parsed = action.schema.safeParse(props.input);

            if (!parsed.success) {
                throw new Error(parsed.error.message);
            }

            return action.check(props);
        },
    };
}
