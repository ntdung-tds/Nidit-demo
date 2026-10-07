import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/** Trang tĩnh: giới thiệu, chính sách, hướng dẫn ... */
export const staticPagesTable = pgTable("static_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  summary: text("summary"),
  content: text("content").notNull().default(""),
  contentEn: text("content_en"),
  status: text("status").notNull().default("published"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedById: integer("updated_by_id").references(() => usersTable.id, { onDelete: "set null" }),
});

export type StaticPageRow = typeof staticPagesTable.$inferSelect;
