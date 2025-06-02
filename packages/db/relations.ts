import { relations } from "drizzle-orm";
import { accounts, communities, communityAdmins, communityConnections, passes, users } from "./schema/public";

export const communityRelations = relations(communities, ({ many }) => ({
    connections: many(communityConnections),
}));

export const communityAdminRelations = relations(communityAdmins, ({ one }) => ({
    community: one(communities, {
        fields: [communityAdmins.community],
        references: [communities.id],
    }),
    user: one(users, {
        fields: [communityAdmins.user],
        references: [users.id],
    }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.user],
        references: [users.id],
    }),
    pass: one(passes, {
        fields: [accounts.id],
        references: [passes.account],
    }),
}));

export const userRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    communities: many(communityAdmins),
}));

export const passRelations = relations(passes, ({ one }) => ({
    heir: one(accounts, {
        fields: [passes.account],
        references: [accounts.id],
    }),
}));

