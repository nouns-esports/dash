import { relations } from "drizzle-orm";
import {
    accounts,
    assets,
    awards,
    bets,
    communities,
    communityAdmins,
    communityPlugins,
    escrows,
    outcomes,
    passes,
    points,
    predictions,
    proposals,
    questActions,
    roundActions,
    questCompletions,
    quests,
    rounds,
    users,
    wallets,
    xp,
    votes,
    events,
    eventActions,
    attendees,
    raffleEntries,
    raffles,
    products,
    productVariants,
    carts,
    collections,
} from "./schema/public";

export const communityRelations = relations(communities, ({ many }) => ({
    rounds: many(rounds),
    events: many(events),
    quests: many(quests),
    admins: many(communityAdmins),
    predictions: many(predictions),
    plugins: many(communityPlugins),
    raffles: many(raffles),
}));

export const communityAdminRelations = relations(communityAdmins, ({ one, many }) => ({
    community: one(communities, {
        fields: [communityAdmins.community],
        references: [communities.id],
    }),
    user: one(users, {
        fields: [communityAdmins.user],
        references: [users.id],
    }),
    wallets: many(wallets),
}));

export const communityPluginRelations = relations(communityPlugins, ({ one }) => ({
    community: one(communities, {
        fields: [communityPlugins.community],
        references: [communities.id],
    }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
    community: one(communities, {
        fields: [events.community],
        references: [communities.id],
    }),
    quests: many(quests),
    rounds: many(rounds),
    attendees: many(attendees),
    predictions: many(predictions),
    products: many(products),
    // checkpoints: many(checkpoints),
    raffles: many(raffles),
    actions: many(eventActions),
}));

export const attendeesRelations = relations(attendees, ({ one, many }) => ({
    event: one(events, {
        fields: [attendees.event],
        references: [events.id],
    }),
    user: one(users, {
        fields: [attendees.user],
        references: [users.id],
    }),
    xp: many(xp),
}));

export const eventActionsRelations = relations(eventActions, ({ one }) => ({
    event: one(events, {
        fields: [eventActions.event],
        references: [events.id],
    }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.user],
        references: [users.id],
    }),
    escrow: one(escrows, {
        fields: [accounts.id],
        references: [escrows.heir],
    }),
}));

export const escrowRelations = relations(escrows, ({ one, many }) => ({
    heir: one(accounts, {
        fields: [escrows.heir],
        references: [accounts.id],
    }),
    community: one(communities, {
        fields: [escrows.community],
        references: [communities.id],
    }),
    wallets: many(wallets),
}));

export const userRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    communities: many(communityAdmins),
    passes: many(passes),
    wallets: many(wallets),
}));

export const walletRelations = relations(wallets, ({ one }) => ({
    user: one(users, {
        fields: [wallets.user],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [wallets.community],
        references: [communities.id],
    }),
}));

export const passRelations = relations(passes, ({ one }) => ({
    user: one(users, {
        fields: [passes.user],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [passes.community],
        references: [communities.id],
    }),
}));

export const pointsRelations = relations(points, ({ one }) => ({
    from: one(users, {
        fields: [points.from],
        references: [users.id],
    }),
    to: one(users, {
        fields: [points.to],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [points.community],
        references: [communities.id],
    }),
}));

export const xpRelations = relations(xp, ({ one }) => ({
    user: one(users, {
        fields: [xp.user],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [xp.community],
        references: [communities.id],
    }),
    quest: one(quests, {
        fields: [xp.quest],
        references: [quests.id],
    }),
}));

export const questRelations = relations(quests, ({ one, many }) => ({
    community: one(communities, {
        fields: [quests.community],
        references: [communities.id],
    }),
    event: one(events, {
        fields: [quests.event],
        references: [events.id],
    }),
    completions: many(questCompletions),
    actions: many(questActions),
    xpRecords: many(xp),
}));

export const questCompletionsRelations = relations(questCompletions, ({ one }) => ({
    quest: one(quests, {
        fields: [questCompletions.quest],
        references: [quests.id],
    }),
}));

export const questActionsRelations = relations(questActions, ({ one }) => ({
    quest: one(quests, {
        fields: [questActions.quest],
        references: [quests.id],
    }),
}));

export const predictionsRelations = relations(predictions, ({ one, many }) => ({
    event: one(events, {
        fields: [predictions.event],
        references: [events.id],
    }),
    outcomes: many(outcomes),
    bets: many(bets),
    earnedXP: many(xp),
    points: many(points),
    community: one(communities, {
        fields: [predictions.community],
        references: [communities.id],
    }),
}));

export const outcomesRelations = relations(outcomes, ({ one, many }) => ({
    prediction: one(predictions, {
        fields: [outcomes.prediction],
        references: [predictions.id],
    }),
    bets: many(bets),
}));

export const betsRelations = relations(bets, ({ one, many }) => ({
    user: one(users, {
        fields: [bets.user],
        references: [users.id],
    }),
    outcome: one(outcomes, {
        fields: [bets.outcome],
        references: [outcomes.id],
    }),
    prediction: one(predictions, {
        fields: [bets.prediction],
        references: [predictions.id],
    }),
    points: many(points),
}));

export const roundsRelations = relations(rounds, ({ one, many }) => ({
    awards: many(awards),
    proposals: many(proposals),
    votes: many(votes),
    community: one(communities, {
        fields: [rounds.community],
        references: [communities.id],
    }),
    event: one(events, {
        fields: [rounds.event],
        references: [events.id],
    }),
    actions: many(roundActions),
}));

export const roundActionsRelations = relations(roundActions, ({ one }) => ({
    round: one(rounds, {
        fields: [roundActions.round],
        references: [rounds.id],
    }),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
    awards: many(awards),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
    round: one(rounds, {
        fields: [proposals.round],
        references: [rounds.id],
    }),
    votes: many(votes),
    user: one(users, {
        fields: [proposals.user],
        references: [users.id],
    }),
    xp: many(xp),
}));

export const votesRelations = relations(votes, ({ one, many }) => ({
    proposal: one(proposals, {
        fields: [votes.proposal],
        references: [proposals.id],
    }),
    round: one(rounds, {
        fields: [votes.round],
        references: [rounds.id],
    }),
    user: one(users, {
        fields: [votes.user],
        references: [users.id],
    }),
    xp: many(xp),
}));

export const rafflesRelations = relations(raffles, ({ many, one }) => ({
    entries: many(raffleEntries),
    event: one(events, {
        fields: [raffles.event],
        references: [events.id],
    }),
    community: one(communities, {
        fields: [raffles.community],
        references: [communities.id],
    }),
}));

export const raffleEntriesRelations = relations(raffleEntries, ({ one, many }) => ({
    raffle: one(raffles, {
        fields: [raffleEntries.raffle],
        references: [raffles.id],
    }),
    user: one(users, {
        fields: [raffleEntries.user],
        references: [users.id],
    }),
    points: many(points),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    collection: one(collections, {
        fields: [products.collection],
        references: [collections.id],
    }),
    event: one(events, {
        fields: [products.event],
        references: [events.id],
    }),
    community: one(communities, {
        fields: [products.community],
        references: [communities.id],
    }),
    variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, {
        fields: [productVariants.product],
        references: [products.id],
    }),
    carts: many(carts),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
    products: many(products),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
    user: one(users, {
        fields: [carts.user],
        references: [users.id],
    }),
    product: one(products, {
        fields: [carts.product],
        references: [products.id],
    }),
    variant: one(productVariants, {
        fields: [carts.variant],
        references: [productVariants.id],
    }),
}));
