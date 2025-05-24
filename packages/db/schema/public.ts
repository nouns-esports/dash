import { pgEnum, pgTable } from "drizzle-orm/pg-core";

export const platforms = pgEnum("platforms", ["discord", "twitter", "farcaster"]);

export const communities = pgTable("communities", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    handle: t.text().notNull().unique(),
    image: t.text().notNull(),
    name: t.text().notNull(),
    // The tier of the community, 0 is free
    tier: t.smallint().notNull().default(0),
    // Custom XP level configuration
    levels: t.jsonb().$type<{
        // Maximum xp required to reach the next level
        max: number;
        // The midpoint of the curve
        midpoint: number;
        // The steepness of the curve
        steepness: number;
    }>(),
    // The custom points branding, defaults to points
    points: t.jsonb().$type<{
        name: string;
        image: string;
    }>(),
    // The custom agent identity, defaults to Dash
    agent: t.jsonb().$type<{
        name: string;
        image: string;
        // The custom system prompt to use for the agent
        prompt: string;
    }>(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
}));

export const communityAdmins = pgTable("community_admins", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().references(() => communities.id).notNull(),
    user: t.uuid().references(() => users.id).notNull(),
}));

export const communityPlatforms = pgTable("community_platforms", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().references(() => communities.id).notNull(),
    platform: platforms().notNull(),
    config: t.jsonb().notNull().$type<any>(),
}));

export const users = pgTable("users", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    privyId: t.text("privy_id").notNull().unique(),
    name: t.text().notNull(),
    image: t.text().notNull(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
}));

export const wallets = pgTable("wallets", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    address: t.text().unique().notNull(),
    user: t.uuid().references(() => users.id),
    community: t.uuid().references(() => communities.id),
}));

export const accounts = pgTable("accounts", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    platform: platforms().notNull(),
    // Discord user id, Farcaster FID, Twitter user id, etc.
    identifier: t.text().notNull(),
    user: t.uuid().references(() => users.id),
}));

export const passes = pgTable("passes", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().references(() => communities.id).notNull(),
    user: t.uuid().references(() => users.id),
    // The account that, in the future, can claim the contents of this pass to their user account that doesn't exist in the present
    heir: t.uuid().references(() => accounts.id),
    points: t.bigint({ mode: "number" }).notNull().default(0),
    xp: t.bigint({ mode: "number" }).notNull().default(0),
}));

export const xp = pgTable("xp", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    amount: t.bigint({ mode: "number" }).notNull(),
    pass: t.uuid().references(() => passes.id).notNull(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));

export const points = pgTable("points", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().references(() => communities.id).notNull(),
    amount: t.bigint({ mode: "number" }).notNull(),
    from: t.uuid().references(() => passes.id).notNull(),
    to: t.uuid().references(() => passes.id).notNull(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));

// export const quests = pgTable("quests", (t) => ({
//     id: t.uuid().primaryKey().defaultRandom(),
//     handle: t.text().notNull().unique(),
//     name: t.text().notNull(),
//     description: t.text(),
//     image: t.text().notNull(),
//     community: t.uuid().references(() => communities.id).notNull(),
//     draft: t.boolean().notNull().default(true),
//     createdAt: t.timestamp().notNull().defaultNow(),
//     active: t.boolean().notNull().default(false),
//     xp: t.bigint({ mode: "number" }).notNull(),
//     points: t.bigint({ mode: "number" }).notNull(),
// }));

// export const questActions = pgTable("quest_actions", (t) => ({
//     id: t.uuid().primaryKey().defaultRandom(),
//     quest: t.uuid().references(() => quests.id).notNull(),
//     tool: t.text().notNull(), // discord:hasRole
//     description: t.jsonb().array().$type<any>().notNull(), // server=1234567890, role=1234567890
//     inputs: t
//         .jsonb()
//         .$type<{ [key: string]: { [key: string]: any | undefined } }>()
//         .notNull(),
// }));

// export const questCompletions = pgTable("quest_completions", (t) => ({
//     id: t.uuid().primaryKey().defaultRandom(),
//     quest: t.uuid().references(() => quests.id).notNull(),
//     user: t.uuid().references(() => users.id).notNull(),
//     timestamp: t.timestamp().notNull().defaultNow(),
//     xp: t.uuid().references(() => xp.id).notNull(),
//     points: t.uuid().references(() => points.id).notNull(),
// }));