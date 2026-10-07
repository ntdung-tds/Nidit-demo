import { and, gte, sql } from "drizzle-orm";
import { db, visitsTable } from "@workspace/db";

export const VN_TZ = "Asia/Ho_Chi_Minh";

/** Ngày theo giờ Việt Nam dạng YYYY-MM-DD */
export function vnDate(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: VN_TZ });
}

/** Thời điểm bắt đầu của ngày (giờ Việt Nam) cách hôm nay `daysBack` ngày */
export function vnDayStart(daysBack: number): Date {
  const today = vnDate(new Date());
  const start = new Date(`${today}T00:00:00+07:00`);
  return new Date(start.getTime() - daysBack * 86_400_000);
}

/** Lượt xem và khách theo ngày, điền 0 cho ngày không có dữ liệu */
export async function dailyVisits(days: number): Promise<{ date: string; views: number; visitors: number }[]> {
  const since = vnDayStart(days - 1);
  // Hằng số múi giờ được chèn trực tiếp để biểu thức SELECT và GROUP BY trùng khớp
  const dayExpr = sql<string>`to_char(${visitsTable.createdAt} at time zone ${sql.raw(`'${VN_TZ}'`)}, 'YYYY-MM-DD')`;
  const rows = await db
    .select({
      date: dayExpr,
      views: sql<number>`count(*)`,
      visitors: sql<number>`count(distinct ${visitsTable.visitorHash})`,
    })
    .from(visitsTable)
    .where(and(gte(visitsTable.createdAt, since)))
    .groupBy(dayExpr);
  const map = new Map(rows.map((r) => [r.date, r]));
  const out: { date: string; views: number; visitors: number }[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = vnDate(new Date(since.getTime() + i * 86_400_000 + 12 * 3_600_000));
    const r = map.get(date);
    out.push({ date, views: Number(r?.views ?? 0), visitors: Number(r?.visitors ?? 0) });
  }
  return out;
}
