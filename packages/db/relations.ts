import { relations } from "drizzle-orm";
import { accounts, communities, communityAdmins, communityPlatforms, users } from "./schema/public";

export const communityRelations = relations(communities, ({ many }) => ({
    platforms: many(communityPlatforms),
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
}));

export const userRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    communities: many(communityAdmins),
}));

