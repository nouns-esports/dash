import { relations } from "drizzle-orm";
import {
    accounts,
    assets,
    awards,
    bets,
    communities,
    communityAdmins,
    communityConnections,
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
} from "./schema/public";

export const communityRelations = relations(communities, ({ many }) => ({
    rounds: many(rounds),
    events: many(events),
    quests: many(quests),
    admins: many(communityAdmins),
    predictions: many(predictions),
    connections: many(communityConnections),
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

export const communityConnectionRelations = relations(communityConnections, ({ one }) => ({
    community: one(communities, {
        fields: [communityConnections.community],
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
    // products: many(products),
    // checkpoints: many(checkpoints),
    // raffles: many(raffles),
    actions: many(eventActions),
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
