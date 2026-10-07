import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Nhật ký truy cập phục vụ bộ đếm và thống kê */
export const visitsTable = pgTable(
  "visits",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    section: text("section").notNull().default("Trang chủ"),
    articleId: integer("article_id"),
    referrerHost: text("referrer_host"),
    visitorHash: text("visitor_hash").notNull(),
    device: text("device").notNull().default("Máy tính"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("visits_created_idx").on(t.createdAt)],
);

export type VisitRow = typeof visitsTable.$inferSelect;
