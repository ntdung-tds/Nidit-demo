import { and, gt, inArray, isNotNull, isNull, lte, or, type SQL } from "drizzle-orm";
import { articlesTable, type CategoryRow } from "@workspace/db";

/**
 * Điều kiện hiển thị công khai của tin bài: đã xuất bản (hoặc đến giờ hẹn),
 * thời điểm xuất bản đã qua và chưa tới giờ gỡ bài.
 */
export function publicArticleCondition(now: Date = new Date()): SQL {
  return and(
    inArray(articlesTable.status, ["published", "scheduled"]),
    isNotNull(articlesTable.publishedAt),
    lte(articlesTable.publishedAt, now),
    or(isNull(articlesTable.unpublishAt), gt(articlesTable.unpublishAt, now)),
  )!;
}

/** Danh sách id của chuyên mục và toàn bộ chuyên mục con cháu */
export function categoryWithDescendants(all: Iterable<CategoryRow>, rootId: number): number[] {
  const list = [...all];
  const ids = [rootId];
  for (let i = 0; i < ids.length; i += 1) {
    for (const c of list) if (c.parentId === ids[i] && !ids.includes(c.id)) ids.push(c.id);
  }
  return ids;
}
