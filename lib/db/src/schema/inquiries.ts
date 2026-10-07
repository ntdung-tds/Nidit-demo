import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { datasetsTable } from "./datasets";
import { evaluationServicesTable } from "./services";
import { usersTable } from "./users";

/** Liên hệ, yêu cầu khai thác dữ liệu, đăng ký đánh giá – kiểm định */
export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organization: text("organization"),
  subject: text("subject"),
  message: text("message").notNull(),
  datasetId: integer("dataset_id").references(() => datasetsTable.id, { onDelete: "set null" }),
  serviceId: integer("service_id").references(() => evaluationServicesTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("new"),
  adminNote: text("admin_note"),
  handledById: integer("handled_by_id").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InquiryRow = typeof inquiriesTable.$inferSelect;
