import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../../env";

import * as publicSchema from "./schema/public";
import * as indexerSchema from "./schema/indexer";
import * as relations from "./relations";

const schema = {
    ...publicSchema,
    ...indexerSchema,
    ...relations,
};

export const db = {
    primary: drizzle(env.PRIMARY_DATABASE_URL, {
        schema,
    }),
    pgpool: drizzle(env.PGPOOL_URL, {
        schema,
    }),
};
