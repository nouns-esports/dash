import { sql } from "drizzle-orm";
import { check, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import type { Platforms, Connections } from "../../platforms";

const platforms = () => text().$type<Platforms>();
const connections = () => text().$type<Connections>();

export const communities = pgTable("communities", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    handle: t.text().notNull().unique(),
    image: t.text().notNull(),
    name: t.text().notNull(),
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
        // The pool of dollars that can be redeemed proportionally from points
        marketcap: number;
    }>(),
    // The custom agent identity, defaults to Dash
    agent: t.jsonb().$type<{
        name: string;
        image: string;
        // The custom system prompt to use for the agent
        prompt: string;
    }>(),
}));

export const communityAdmins = pgTable("community_admins", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().notNull(),
    user: t.uuid().notNull(),
    owner: t.boolean().notNull(),
}));

export const communityConnections = pgTable("community_connections", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    type: connections().notNull(),
    platform: platforms().notNull(),
    community: t.uuid().notNull(),
    config: t.jsonb().notNull().$type<Record<string, any>>(),
}));

export const users = pgTable("users", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    privyId: t.text("privy_id").notNull().unique(),
    name: t.text().notNull(),
    image: t.text().notNull(),
}));

export const wallets = pgTable("wallets", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    address: t.text().unique().notNull(),
    user: t.uuid(),
    community: t.uuid(),
}), (t) => [
    check(
        "user_or_community_exists",
        sql`(user IS NOT NULL OR community IS NOT NULL)`
    )
]);

export const accounts = pgTable("accounts", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    platform: platforms().notNull(),
    // Discord user id, Farcaster FID, Twitter user id, etc.
    identifier: t.text().notNull(),
    user: t.uuid().notNull(),
}));

export const passes = pgTable("passes", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().notNull(),
    user: t.uuid().notNull(),
    // The number of boosts the user has on this community
    boosts: t.integer().notNull().default(0),
    points: t.bigint({ mode: "number" }).notNull().default(0),
    xp: t.bigint({ mode: "number" }).notNull().default(0),
}));

// Create points and xp records on claim
export const escrows = pgTable("escrows", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    // The account that, in the future, can claim the contents of this escrow to their user account that doesn't exist in the present
    heir: t.uuid().notNull(),
    community: t.uuid().notNull(),
    points: t.bigint({ mode: "number" }).notNull().default(0),
    xp: t.bigint({ mode: "number" }).notNull().default(0),
}));

export const xp = pgTable("xp", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().notNull(),
    user: t.uuid().notNull(),
    amount: t.bigint({ mode: "number" }).notNull(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));

export const points = pgTable("points", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().notNull(),
    amount: t.bigint({ mode: "number" }).notNull(),
    from: t.uuid(),
    to: t.uuid(),
    timestamp: t.timestamp().notNull().defaultNow(),
}), (t) => [
    check(
        "from_or_to_exists",
        sql`("from" IS NOT NULL OR "to" IS NOT NULL)`
    )
]);

// On frontend, use difficulty levels to determine xp and points to ensure consistency
// export const quests = pgTable("quests", (t) => ({
//     id: t.uuid().primaryKey().defaultRandom(),
//     handle: t.text().notNull().unique(),
//     name: t.text().notNull(),
//     description: t.text(),
//     image: t.text().notNull(),
//     community: t.uuid().notNull(),
//     draft: t.boolean().notNull().default(true),
//     createdAt: t.timestamp().notNull().defaultNow(),
//     active: t.boolean().notNull().default(false),
//     xp: t.bigint({ mode: "number" }).notNull(),
//     points: t.bigint({ mode: "number" }).notNull(),
// }));

// export const questActions = pgTable("quest_actions", (t) => ({
//     id: t.uuid().primaryKey().defaultRandom(),
//     quest: t.uuid().notNull(),
//     tool: t.text().notNull(), // discord:hasRole
//     description: t.jsonb().array().$type<any>().notNull(), // server=1234567890, role=1234567890
//     inputs: t
//         .jsonb()
//         .$type<{ [key: string]: { [key: string]: any | undefined } }>()
//         .notNull(),
// }));

// export const questCompletions = pgTable("quest_completions", (t) => ({
//     id: t.uuid().primaryKey().defaultRandom(),
//     quest: t.uuid().notNull(),
//     user: t.uuid().notNull(),
//     timestamp: t.timestamp().notNull().defaultNow(),
//     xp: t.uuid().notNull(),
//     points: t.uuid().notNull(),  
// }));