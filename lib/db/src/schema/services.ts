import { integer, jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";
import { activityFieldsTable } from "./research";

export type ProcessStepJson = { title: string; description: string };

/** Dịch vụ đánh giá, thử nghiệm, kiểm định */
export const evaluationServicesTable = pgTable("evaluation_services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  fieldId: integer("field_id").references(() => activityFieldsTable.id, { onDelete: "set null" }),
  standards: text("standards").array().notNull().default([]),
  process: jsonb("process").$type<ProcessStepJson[]>().notNull().default([]),
  deliverables: text("deliverables").array().notNull().default([]),
  targetAudience: text("target_audience").array().notNull().default([]),
  turnaround: text("turnaround").notNull().default(""),
  feeNote: text("fee_note").notNull().default(""),
  icon: text("icon").notNull().default("shield-check"),
  contactEmail: text("contact_email").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type EvaluationServiceRow = typeof evaluationServicesTable.$inferSelect;
