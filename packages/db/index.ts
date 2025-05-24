import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "~/env";

import * as publicSchema from "./schema/public";

import * as relations from "./relations";

const schema = {
	...publicSchema,
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
