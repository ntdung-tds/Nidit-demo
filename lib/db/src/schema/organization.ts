import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

/** Lãnh đạo Viện */
export const leadersTable = pgTable("leaders", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  position: text("position").notNull(),
  responsibilities: text("responsibilities").array().notNull().default([]),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Đơn vị trực thuộc / cơ cấu tổ chức */
export const orgUnitsTable = pgTable("org_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  type: text("type").notNull(),
  headName: text("head_name"),
  headTitle: text("head_title"),
  description: text("description").notNull().default(""),
  tasks: text("tasks").array().notNull().default([]),
  email: text("email"),
  phone: text("phone"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type LeaderRow = typeof leadersTable.$inferSelect;
export type OrgUnitRow = typeof orgUnitsTable.$inferSelect;
