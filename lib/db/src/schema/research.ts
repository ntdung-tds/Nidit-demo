import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Lĩnh vực hoạt động của Viện */
export const activityFieldsTable = pgTable("activity_fields", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  shortName: text("short_name").notNull(),
  summary: text("summary").notNull().default(""),
  summaryEn: text("summary_en"),
  description: text("description").notNull().default(""),
  highlights: text("highlights").array().notNull().default([]),
  icon: text("icon").notNull().default("cpu"),
  coverImage: text("cover_image"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type ProjectMilestoneJson = { title: string; date: string; done: boolean };

/** Đề tài, dự án, nhiệm vụ KH&CN */
export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  level: text("level").notNull(),
  status: text("status").notNull(),
  fieldId: integer("field_id").references(() => activityFieldsTable.id, { onDelete: "set null" }),
  leadName: text("lead_name").notNull(),
  leadUnit: text("lead_unit").notNull().default(""),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  budget: text("budget"),
  summary: text("summary").notNull().default(""),
  objectives: text("objectives").array().notNull().default([]),
  results: text("results"),
  partners: text("partners").array().notNull().default([]),
  milestones: jsonb("milestones").$type<ProjectMilestoneJson[]>().notNull().default([]),
  keywords: text("keywords").array().notNull().default([]),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Công bố khoa học */
export const publicationsTable = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  venue: text("venue").notNull().default(""),
  type: text("type").notNull(),
  year: integer("year").notNull(),
  doi: text("doi"),
  url: text("url"),
  abstract: text("abstract").notNull().default(""),
  keywords: text("keywords").array().notNull().default([]),
  indexing: text("indexing"),
  isInternational: boolean("is_international").notNull().default(false),
  citationCount: integer("citation_count").notNull().default(0),
  fieldId: integer("field_id").references(() => activityFieldsTable.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityFieldRow = typeof activityFieldsTable.$inferSelect;
export type ProjectRow = typeof projectsTable.$inferSelect;
export type PublicationRow = typeof publicationsTable.$inferSelect;
