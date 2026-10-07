import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { activityFieldsTable } from "./research";

export type DatasetAccessMethodJson = {
  type: "link" | "api" | "object_storage";
  label: string;
  url: string;
  note: string | null;
};

export type DatasetColumnJson = { name: string; type: string; description: string };

/** Bộ dữ liệu phục vụ nghiên cứu, huấn luyện AI */
export const datasetsTable = pgTable("datasets", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  fieldId: integer("field_id").references(() => activityFieldsTable.id, { onDelete: "set null" }),
  publisher: text("publisher").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  license: text("license").notNull().default(""),
  accessLevel: text("access_level").notNull().default("open"),
  accessMethods: jsonb("access_methods").$type<DatasetAccessMethodJson[]>().notNull().default([]),
  formats: text("formats").array().notNull().default([]),
  sizeLabel: text("size_label").notNull().default(""),
  recordCount: integer("record_count").notNull().default(0),
  language: text("language").notNull().default("Tiếng Việt"),
  updateFrequency: text("update_frequency").notNull().default(""),
  version: text("version").notNull().default("1.0"),
  keywords: text("keywords").array().notNull().default([]),
  aiTasks: text("ai_tasks").array().notNull().default([]),
  conditions: text("conditions").notNull().default(""),
  columns: jsonb("columns").$type<DatasetColumnJson[]>().notNull().default([]),
  coverImage: text("cover_image"),
  downloadCount: integer("download_count").notNull().default(0),
  requestCount: integer("request_count").notNull().default(0),
  issuedDate: text("issued_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DatasetRow = typeof datasetsTable.$inferSelect;
