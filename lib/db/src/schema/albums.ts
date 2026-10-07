import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type AlbumItemJson = {
  type: "photo" | "video";
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
};

/** Thư viện ảnh / video */
export const albumsTable = pgTable("albums", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  eventDate: text("event_date"),
  items: jsonb("items").$type<AlbumItemJson[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AlbumRow = typeof albumsTable.$inferSelect;
