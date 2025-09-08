import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Users table (required by better-auth) - SQLite version
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Campaigns table - SQLite version
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: text("status", { enum: ["Draft", "Active", "Paused", "Completed"] }).default("Draft").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

// Leads table - SQLite version
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  status: text("status", { enum: ["Pending", "Contacted", "Responded", "Converted"] }).default("Pending").notNull(),
  lastContactDate: integer("last_contact_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [leads.campaignId],
    references: [campaigns.id],
  }),
}));