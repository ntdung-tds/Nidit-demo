import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

/** Mục menu (main | footer | links), hỗ trợ nhiều cấp qua parent_id */
export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  labelEn: text("label_en"),
  url: text("url").notNull(),
  parentId: integer("parent_id"),
  location: text("location").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  openInNewTab: boolean("open_in_new_tab").notNull().default(false),
});

/** Chuyên mục tin bài nhiều cấp */
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

export type MenuItemRow = typeof menuItemsTable.$inferSelect;
export type CategoryRow = typeof categoriesTable.$inferSelect;
