import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { activityFieldsTable, projectsTable } from "./research";

/** Văn bản: pháp quy, chỉ đạo điều hành, hướng dẫn, báo cáo, tiêu chuẩn, biểu mẫu */
export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  title: text("title").notNull(),
  docType: text("doc_type").notNull(),
  docGroup: text("doc_group").notNull(),
  issuer: text("issuer").notNull(),
  signer: text("signer"),
  issuedDate: text("issued_date").notNull(),
  effectiveDate: text("effective_date"),
  fieldId: integer("field_id").references(() => activityFieldsTable.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  summary: text("summary"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileFormat: text("file_format"),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DocumentRow = typeof documentsTable.$inferSelect;
