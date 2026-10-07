import { and, desc, eq, ne } from "drizzle-orm";
import { db, articleHistoryTable, articlesTable, categoriesTable, usersTable, type ArticleRow, type UserRow } from "@workspace/db";
import type { AdminArticle } from "@workspace/api-zod";
import { badRequest } from "./http";
import { loadLookups, toAdminArticle } from "./serializers";
import { slugify, uniqueSlug } from "./text";
import { availableActions } from "./workflow";

export async function userNameMap(): Promise<Map<number, string>> {
  const rows = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  return new Map(rows.map((u) => [u.id, u.fullName]));
}

export async function articleSlug(input: string, excludeId?: number): Promise<string> {
  return uniqueSlug(slugify(input, "tin-bai"), async (slug) => {
    const rows = await db
      .select({ id: articlesTable.id })
      .from(articlesTable)
      .where(excludeId ? and(eq(articlesTable.slug, slug), ne(articlesTable.id, excludeId)) : eq(articlesTable.slug, slug))
      .limit(1);
    return rows.length > 0;
  });
}

export async function assertCategoryExists(categoryId: number | null | undefined): Promise<void> {
  if (categoryId == null) return;
  const rows = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.id, categoryId)).limit(1);
  if (!rows.length) throw badRequest("Chuyên mục không tồn tại");
}

/** Ghi một dòng lịch sử thao tác của bài viết (actor null = hệ thống tự động) */
export async function addHistory(
  articleId: number,
  actor: UserRow | null,
  entry: { action: string; fromStatus: string | null; toStatus: string; note?: string | null },
): Promise<void> {
  await db.insert(articleHistoryTable).values({
    articleId,
    action: entry.action,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    actorId: actor?.id ?? null,
    actorName: actor?.fullName ?? "Hệ thống",
    actorRole: actor?.role ?? null,
    note: entry.note ?? null,
  });
}

/** Bài viết đầy đủ cho khu quản trị: kèm lịch sử và các thao tác được phép */
export async function buildAdminArticle(row: ArticleRow, actor: UserRow): Promise<AdminArticle> {
  const [lk, users, history] = await Promise.all([
    loadLookups(),
    userNameMap(),
    db
      .select()
      .from(articleHistoryTable)
      .where(eq(articleHistoryTable.articleId, row.id))
      .orderBy(desc(articleHistoryTable.createdAt), desc(articleHistoryTable.id)),
  ]);
  return toAdminArticle(row, lk, users, history, availableActions(actor.role, row.status));
}
