import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  primaryBlocker: text("primary_blocker").notNull(),
  secondaryBlocker: text("secondary_blocker").notNull(),
  primarySubpattern: text("primary_subpattern"),
  resistanceBand: text("resistance_band").notNull(),
  utmsJson: text("utms_json").notNull().default("{}"),
  source: text("source"),
  funnelVersion: integer("funnel_version").notNull().default(3),
  quizVersion: integer("quiz_version").notNull().default(3),
  consentVersion: text("consent_version").notNull().default("lead-save-v1"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_leads_email").on(table.email)]);
