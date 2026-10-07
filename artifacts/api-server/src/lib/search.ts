import { or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { foldVietnamese, likePattern, VI_TRANSLATE_FROM, VI_TRANSLATE_TO } from "./text";

type Searchable = AnyColumn | SQL;

/** Biểu thức SQL: chữ thường, bỏ dấu tiếng Việt */
export function foldSql(expr: Searchable): SQL {
  return sql`translate(lower(coalesce(${expr}, '')), ${VI_TRANSLATE_FROM}, ${VI_TRANSLATE_TO})`;
}

/** Ghép mảng text thành chuỗi để tìm kiếm */
export function arrayText(column: AnyColumn): SQL {
  return sql`array_to_string(${column}, ' ')`;
}

/** Điều kiện tìm kiếm không phân biệt dấu trên nhiều cột */
export function textSearch(query: string | undefined, columns: Searchable[]): SQL | undefined {
  const q = query?.trim();
  if (!q) return undefined;
  const pattern = likePattern(foldVietnamese(q));
  return or(...columns.map((c) => sql`${foldSql(c)} like ${pattern}`));
}
