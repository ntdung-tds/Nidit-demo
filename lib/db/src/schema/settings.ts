import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Cấu hình chung của Trang TTĐT (một bản ghi duy nhất, id = 1) */
export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  siteName: text("site_name").notNull(),
  siteNameEn: text("site_name_en").notNull().default(""),
  shortName: text("short_name").notNull().default(""),
  parentOrg: text("parent_org").notNull().default(""),
  parentOrgEn: text("parent_org_en").notNull().default(""),
  parentPortalUrl: text("parent_portal_url").notNull().default(""),
  address: text("address").notNull().default(""),
  addressEn: text("address_en").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  responsiblePerson: text("responsible_person").notNull().default(""),
  responsibleTitle: text("responsible_title").notNull().default(""),
  copyrightNote: text("copyright_note").notNull().default(""),
  workingHours: text("working_hours").notNull().default(""),
  mapEmbedUrl: text("map_embed_url"),
  facebookUrl: text("facebook_url"),
  youtubeUrl: text("youtube_url"),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  seoKeywords: text("seo_keywords").array().notNull().default([]),
  demoNotice: text("demo_notice"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSettingsRow = typeof siteSettingsTable.$inferSelect;
