import { index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Nhật ký thao tác của người dùng quản trị và hệ thống */
export const activityLogsTable = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id"),
    actorName: text("actor_name").notNull(),
    actorRole: text("actor_role"),
    action: text("action").notNull(),
    actionLabel: text("action_label").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id"),
    entityTitle: text("entity_title"),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_logs_created_idx").on(t.createdAt)],
);

export type BackupTableCountJson = { table: string; rows: number };

/** Bản sao lưu dữ liệu (nội dung lưu dạng JSON) */
export const backupsTable = pgTable("backups", {
  id: serial("id").primaryKey(),
  note: text("note"),
  createdById: integer("created_by_id"),
  createdByName: text("created_by_name"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  tables: jsonb("tables").$type<BackupTableCountJson[]>().notNull().default([]),
  data: jsonb("data").$type<Record<string, unknown[]>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Thư viện tư liệu (đăng ký theo đường dẫn) */
export const mediaTable = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  alt: text("alt"),
  type: text("type").notNull().default("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityLogRow = typeof activityLogsTable.$inferSelect;
export type BackupRow = typeof backupsTable.$inferSelect;
export type MediaRow = typeof mediaTable.$inferSelect;
