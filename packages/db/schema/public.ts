import { sql } from "drizzle-orm";
import { check, index, pgTable, text, unique } from "drizzle-orm/pg-core";
import type { Platforms } from "../../platforms";

const platforms = () => text().$type<Platforms>();

export const meta = pgTable(
    "meta",
    (t) => ({
        maintenance: t.boolean().notNull().default(false),
    }),
    (t) => [check("meta_only_one_record", sql`(SELECT COUNT(*) FROM "meta") <= 1`)],
);

export const communities = pgTable("communities", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    handle: t.text().notNull().unique(),
    image: t.text().notNull(),
    name: t.text().notNull(),
    // Custom XP level configuration
    levels: t.jsonb().$type<{
        // Starting xp required to reach level 2
        base: number;
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
    // DEPRECATED
    deprecated_description: t.jsonb("description"),
    deprecated_parentUrl: t.text("parent_url"),
    deprecated_details: t.jsonb("details"),
    deprecated_featured: t.boolean("featured").notNull().default(false),
}));

export const communityAdmins = pgTable(
    "community_admins",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        community: t.uuid().notNull(),
        user: t.uuid().notNull(),
        owner: t.boolean().notNull(),
    }),
    (t) => [unique("community_user_unique").on(t.community, t.user)],
);

export const communityConnections = pgTable("community_connections", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().notNull(),
    platform: platforms().notNull(),
    config: t.jsonb().notNull().$type<Record<string, any>>(),
}));

export const users = pgTable("users", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    privyId: t.text("privy_id").notNull().unique(),
    name: t.text().notNull(),
    image: t.text().notNull(),
    admin: t.boolean().notNull().default(false),
    canRecieveEmails: t.boolean("can_recieve_emails").notNull().default(false),
    // DEPRECATED
    deprecated_bio: t.text("bio"),
    deprecated_twitter: t.text("twitter"),
    deprecated_discord: t.text("discord"),
    deprecated_fid: t.integer("fid"),
}));

export const wallets = pgTable(
    "wallets",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        address: t.text().unique().notNull(),
        user: t.uuid(),
        community: t.uuid(),
    }),
    (t) => [check("user_or_community_exists", sql`(user IS NOT NULL OR community IS NOT NULL)`)],
);

export const accounts = pgTable(
    "accounts",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        platform: platforms().notNull(),
        // Discord user id, Farcaster FID, Twitter user id, etc.
        identifier: t.text().notNull(),
        user: t.uuid(),
    }),
    (t) => [unique("accounts_platform_identifier_unique").on(t.platform, t.identifier)],
);

export const passes = pgTable(
    "passes",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        community: t.uuid().notNull(),
        user: t.uuid().notNull(),
        points: t.numeric({ precision: 38, scale: 18, mode: "number" }).notNull().default(0),
        xp: t.bigint({ mode: "number" }).notNull().default(0),
    }),
    (t) => [
        unique("passes_user_community_unique").on(t.user, t.community),
        index("passes_xp_idx").on(t.xp),
        index("passes_points_idx").on(t.points),
        check("points_balance", sql`${t.points} >= 0`),
    ],
);

// export const charges = pgTable(
//     "charges",
//     (t) => ({
//         id: t.uuid().primaryKey().defaultRandom(),
//         user: t.uuid().notNull(),
//         community: t.uuid().notNull(),
//         payer: t.uuid().notNull(),
//         count: t.integer().notNull(),
//         timestamp: t.timestamp().notNull().defaultNow(),
//         expires: t.timestamp().notNull(),
//         renew: t.boolean().notNull(),
//     }),
//     (t) => [
//         unique("charges_user_community_unique").on(t.user, t.community, t.payer),
//         check("count_positive", sql`${t.count} > 0`),
//     ],
// );

export const escrows = pgTable(
    "escrows",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        // The account that, in the future, can claim the contents of this escrow to their user account that doesn't exist in the present
        heir: t.uuid().notNull(),
        community: t.uuid().notNull(),
        points: t.numeric({ precision: 38, scale: 18, mode: "number" }).notNull().default(0),
        xp: t.bigint({ mode: "number" }).notNull().default(0),
        claimed: t.boolean().notNull().default(false),
    }),
    (t) => [unique("escrows_heir_community_unique").on(t.heir, t.community)],
);

export const xp = pgTable("xp", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    community: t.uuid().notNull(),
    user: t.uuid().notNull(),
    amount: t.bigint({ mode: "number" }).notNull(), // Convert to Bigint
    timestamp: t.timestamp().notNull().defaultNow(),
    // Think
    quest: t.uuid(),
    snapshot: t.uuid(),
    checkin: t.uuid(),
    prediction: t.uuid(),
    vote: t.uuid(),
    proposal: t.uuid(),
    order: t.text(),
    raffleEntry: t.uuid(),
    attendee: t.uuid(),
}));

export const points = pgTable(
    "points",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        community: t.uuid().notNull(),
        amount: t.numeric({ precision: 38, scale: 18, mode: "number" }).notNull(),
        from: t.uuid(),
        fromEscrow: t.uuid(),
        to: t.uuid(),
        toEscrow: t.uuid(),
        timestamp: t.timestamp().notNull().defaultNow(),
        // Think
        order: t.text(),
        checkin: t.uuid(),
        raffleEntry: t.uuid(),
        bet: t.uuid(),
        prediction: t.uuid(),
    }),
    (t) => [
        check("from_or_to_exists", sql`("from" IS NOT NULL OR "to" IS NOT NULL)`),
        check(
            "from_and_fromEscrow_not_both_present",
            sql`NOT ("from" IS NOT NULL AND "fromEscrow" IS NOT NULL)`,
        ),
        check(
            "to_and_toEscrow_not_both_present",
            sql`NOT ("to" IS NOT NULL AND "toEscrow" IS NOT NULL)`,
        ),
    ],
);

// On frontend, use difficulty levels to determine xp and points to ensure consistency
export const quests = pgTable(
    "quests",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        handle: t.text().notNull(),
        name: t.text().notNull(),
        description: t.jsonb().$type<any>(),
        image: t.text().notNull(),
        community: t.uuid().notNull(),
        event: t.uuid(),
        draft: t.boolean().notNull().default(true),
        createdAt: t.timestamp("created_at").notNull().defaultNow(),
        active: t.boolean().notNull().default(false),
        xp: t.bigint({ mode: "number" }).notNull(),
        points: t.bigint({ mode: "number" }).notNull(),
        // DEPRECATED
        deprecated_start: t.timestamp("start"),
        deprecated_end: t.timestamp("end"),
        deprecated_featured: t.boolean("featured").notNull().default(false),
    }),
    (t) => [unique("quests_handle_and_community_unique").on(t.handle, t.community)],
);

export const questActions = pgTable("quest_actions", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    quest: t.uuid().notNull(),
    action: t.text().notNull(),
    platform: platforms(),
    description: t.jsonb().array().$type<any>().notNull(),
    input: t.jsonb().$type<{ [key: string]: { [key: string]: any | undefined } }>().notNull(),
}));

export const questCompletions = pgTable(
    "quest_completions",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        quest: t.uuid().notNull(),
        user: t.uuid().notNull(),
        timestamp: t.timestamp().notNull().defaultNow(),
        // xp: t.uuid().notNull(),
        // points: t.uuid().notNull(),
    }),
    (t) => [unique("quest_completions_quest_user_unique").on(t.quest, t.user)],
);

export const predictions = pgTable(
    "predictions",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        handle: t.text().notNull(),
        event: t.uuid(),
        community: t.uuid().notNull(),
        draft: t.boolean().notNull().default(true),
        name: t.text().notNull(),
        image: t.text().notNull(),
        rules: t.jsonb().$type<any>().notNull(),
        xp: t.integer().notNull(),
        // points: t.integer().notNull().default(0), // NEW
        closed: t.boolean().notNull().default(false),
        resolved: t.boolean().notNull().default(false),
        start: t.timestamp(),
        end: t.timestamp(),
        pool: t.numeric({ precision: 38, scale: 18, mode: "number" }).notNull().default(0),
        // DEPRECATED
        deprecated_featured: t.boolean("featured").notNull().default(false),
    }),
    (t) => [unique("predictions_handle_community_unique").on(t.handle, t.community)],
);

export const outcomes = pgTable("outcomes", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    prediction: t.uuid().notNull(),
    name: t.text().notNull(),
    image: t.text(),
    result: t.boolean(),
    pool: t.numeric({ precision: 38, scale: 18, mode: "number" }).notNull().default(0),
}));

export const bets = pgTable("bets", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    user: t.uuid().notNull(),
    outcome: t.uuid().notNull(),
    amount: t.numeric({ precision: 38, scale: 18, mode: "number" }).notNull().default(0),
    prediction: t.uuid().notNull(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));

export const events = pgTable(
    "events",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        handle: t.text().notNull(),
        name: t.text().notNull(),
        image: t.text().notNull(),
        description: t.text().notNull().default(""),
        start: t.timestamp({ mode: "date" }).notNull(),
        end: t.timestamp({ mode: "date" }).notNull(),
        community: t.uuid().notNull(),
        draft: t.boolean().notNull().default(true),
        location: t.jsonb().$type<{
            name: string;
            url: string;
        }>(),
        details: t.jsonb().$type<any>(),
        attendeeCount: t.integer("attendee_count"),
        // DEPRECATED
        deprecated_featured: t.boolean("featured").notNull().default(false),
        deprecated_callToAction: t.jsonb("call_to_action").$type<{
            disabled: boolean;
            label: string;
            url: string;
        }>(),
    }),
    (t) => [unique("events_handle_community_unique").on(t.handle, t.community)],
);

export const eventActions = pgTable("event_actions", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    event: t.uuid().notNull(),
    action: t.text().notNull(),
    platform: platforms(),
    description: t.jsonb().array().$type<any>().notNull(),
    input: t.jsonb().$type<{ [key: string]: { [key: string]: any } }>().notNull(),
}));

export const attendees = pgTable(
    "attendees",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        event: t.uuid().notNull(),
        user: t.uuid().notNull(),
        // DEPRECATED
        deprecated_featured: t.boolean("featured"),
    }),
    (t) => [unique("attendees_event_user_unique").on(t.event, t.user)],
);

export const snapshots = pgTable("snapshots", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    user: t.uuid().notNull(),
    type: t.text().notNull(),
    tag: t.text(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));

export const visits = pgTable("visits", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    user: t.uuid().notNull(),
    url: t.text().notNull(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));

export const rounds = pgTable(
    "rounds",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        handle: t.text().notNull(),
        name: t.text().notNull(),
        image: t.text().notNull(),
        community: t.uuid().notNull(),
        event: t.uuid(),
        draft: t.boolean().notNull().default(true),
        type: t
            .text({ enum: ["markdown", "video", "image", "url"] })
            .notNull()
            .default("markdown"),
        content: t.text().notNull(),
        description: t.jsonb().$type<any>(),
        start: t.timestamp().notNull(),
        votingStart: t.timestamp("voting_start").notNull(),
        end: t.timestamp().notNull(),
        minTitleLength: t.integer("min_title_length").notNull().default(15),
        maxTitleLength: t.integer("max_title_length").notNull().default(1000),
        minDescriptionLength: t.integer("min_description_length").notNull().default(0),
        maxDescriptionLength: t.integer("max_description_length").notNull().default(2000),
        linkRegex: t.text("link_regex"),
        maxProposals: t.smallint("max_proposals").default(1),
        // DEPRECATED
        deprecated_featured: t.boolean("featured").notNull().default(false),
    }),
    (t) => [unique("rounds_handle_community_unique").on(t.handle, t.community)],
);

export const roundActions = pgTable("round_actions", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    round: t.uuid().notNull(),
    type: t
        .text({ enum: ["voting", "proposing"] })
        .notNull()
        .default("voting"),
    required: t.boolean().notNull().default(true),
    votes: t.integer().notNull().default(0),
    action: t.text().notNull(),
    platform: platforms(),
    description: t.jsonb().array().$type<any>().notNull(),
    input: t.jsonb().$type<{ [key: string]: { [key: string]: any } }>().notNull(),
}));

// add user column and update it when they claim the award
export const awards = pgTable(
    "awards",
    (t) => ({
        id: t.uuid().primaryKey().defaultRandom(),
        round: t.uuid().notNull(),
        place: t.smallint().notNull(),
        asset: t.uuid().notNull(),
        value: t.numeric({ precision: 78, scale: 0 }).notNull(),
        claimed: t.boolean().notNull().default(false),
    }),
    (t) => [unique("awards_round_place_unique").on(t.round, t.place)],
);

// Rethink the way we handle awards and assets
export const assets = pgTable("assets", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    name: t.text().notNull(),
    image: t.text().notNull(),
    decimals: t.smallint(),
    chainId: t.integer("chain_id"),
    address: t.text(),
    tokenId: t.text("token_id"),
}));

export const proposals = pgTable("proposals", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    user: t.uuid().notNull(),
    round: t.uuid().notNull(),
    title: t.text().notNull(),
    content: t.text(),
    image: t.text(),
    video: t.text(),
    url: t.text(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    hidden: t.boolean().notNull().default(false),
    published: t.boolean().notNull().default(true),
    winner: t.smallint(),
}));

export const votes = pgTable("votes", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    user: t.uuid().notNull(),
    proposal: t.uuid().notNull(),
    round: t.uuid().notNull(),
    count: t.smallint().notNull(),
    timestamp: t.timestamp().notNull().defaultNow(),
}));
