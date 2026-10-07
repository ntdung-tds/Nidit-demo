import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Tài khoản quản trị (admin | editor | reviewer) */
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  title: text("title").notNull().default(""),
  unit: text("unit").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof usersTable.$inferSelect;
export type InsertUserRow = typeof usersTable.$inferInsert;
