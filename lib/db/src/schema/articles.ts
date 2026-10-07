import { boolean, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { categoriesTable } from "./navigation";
import { usersTable } from "./users";

/** Tin bài, đi qua quy trình biên tập – duyệt – xuất bản */
export const articlesTable = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull().default(""),
    content: text("content").notNull().default(""),
    status: text("status").notNull().default("draft"),
    categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
    language: text("language").notNull().default("vi"),
    coverImage: text("cover_image"),
    coverCaption: text("cover_caption"),
    authorName: text("author_name"),
    keywords: text("keywords").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    eventStartAt: timestamp("event_start_at", { withTimezone: true }),
    eventLocation: text("event_location"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdById: integer("created_by_id").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    unpublishAt: timestamp("unpublish_at", { withTimezone: true }),
    viewCount: integer("view_count").notNull().default(0),
    origin: text("origin").notNull().default("manual"),
    reviewerNote: text("reviewer_note"),
  },
  (t) => [
    index("articles_status_published_idx").on(t.status, t.publishedAt),
    index("articles_category_idx").on(t.categoryId),
  ],
);

/** Lịch sử thao tác trên một bài viết */
export const articleHistoryTable = pgTable(
  "article_history",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articlesTable.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actorId: integer("actor_id").references(() => usersTable.id, { onDelete: "set null" }),
    actorName: text("actor_name").notNull(),
    actorRole: text("actor_role"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("article_history_article_idx").on(t.articleId)],
);

export type ArticleRow = typeof articlesTable.$inferSelect;
export type InsertArticleRow = typeof articlesTable.$inferInsert;
export type ArticleHistoryRow = typeof articleHistoryTable.$inferSelect;
