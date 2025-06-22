import { relations } from "drizzle-orm";
import {
    accounts,
    communities,
    communityAdmins,
    communityConnections,
    escrows,
    passes,
    points,
    questActions,
    questCompletions,
    quests,
    users,
    wallets,
    xp,
} from "./schema/public";

export const communityRelations = relations(communities, ({ many }) => ({
    connections: many(communityConnections),
    admins: many(communityAdmins),
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
    // event: one(events, {
    //     fields: [quests.event],
    //     references: [events.id],
    // }),
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
