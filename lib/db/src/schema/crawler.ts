import { boolean, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { articlesTable } from "./articles";
import { categoriesTable } from "./navigation";

/** Nguồn RSS được phép thu thập (tối đa 5 nguồn) */
export const crawlSourcesTable = pgTable("crawl_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  intervalMinutes: integer("interval_minutes").notNull().default(60),
  keywords: text("keywords").array().notNull().default([]),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  lastStatus: text("last_status").notNull().default("never"),
  lastMessage: text("last_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Tin thu thập được, chờ biên tập viên xem xét (không tự động xuất bản) */
export const crawlItemsTable = pgTable(
  "crawl_items",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id")
      .notNull()
      .references(() => crawlSourcesTable.id, { onDelete: "cascade" }),
    guidHash: text("guid_hash").notNull().unique(),
    title: text("title").notNull(),
    link: text("link").notNull(),
    summary: text("summary"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    status: text("status").notNull().default("pending"),
    articleId: integer("article_id").references(() => articlesTable.id, { onDelete: "set null" }),
    matchedKeywords: text("matched_keywords").array().notNull().default([]),
  },
  (t) => [index("crawl_items_source_status_idx").on(t.sourceId, t.status)],
);

export type CrawlSourceRow = typeof crawlSourcesTable.$inferSelect;
export type CrawlItemRow = typeof crawlItemsTable.$inferSelect;
