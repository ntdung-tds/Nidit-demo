import { and, inArray, isNotNull, isNull, lte, or, eq, sql } from "drizzle-orm";
import { db, articlesTable, crawlSourcesTable } from "@workspace/db";
import { logger } from "./logger";
import { logActivity } from "./activity";
import { addHistory } from "./articles";
import { runCrawlSource } from "./crawler";

const TICK_MS = 30_000;
let running = false;
let timer: NodeJS.Timeout | null = null;

/** Xuất bản các bài hẹn giờ đã đến giờ và gỡ các bài đã hết hạn hiển thị */
async function publishAndUnpublish(now: Date) {
  const due = await db
    .update(articlesTable)
    .set({ status: "published", updatedAt: now })
    .where(and(eq(articlesTable.status, "scheduled"), isNotNull(articlesTable.publishedAt), lte(articlesTable.publishedAt, now)))
    .returning({ id: articlesTable.id, title: articlesTable.title });
  for (const a of due) {
    await addHistory(a.id, null, { action: "auto_publish", fromStatus: "scheduled", toStatus: "published", note: "Tự động xuất bản theo lịch" });
    await logActivity(null, {
      action: "auto_publish",
      actionLabel: "Tự động xuất bản bài hẹn giờ",
      entityType: "article",
      entityId: a.id,
      entityTitle: a.title,
    });
  }

  const expired = await db
    .update(articlesTable)
    .set({ status: "unpublished", updatedAt: now })
    .where(
      and(
        inArray(articlesTable.status, ["published", "scheduled"]),
        isNotNull(articlesTable.unpublishAt),
        lte(articlesTable.unpublishAt, now),
      ),
    )
    .returning({ id: articlesTable.id, title: articlesTable.title });
  for (const a of expired) {
    await addHistory(a.id, null, { action: "auto_unpublish", fromStatus: "published", toStatus: "unpublished", note: "Tự động gỡ bài khi hết thời hạn hiển thị" });
    await logActivity(null, {
      action: "auto_unpublish",
      actionLabel: "Tự động gỡ bài hết hạn",
      entityType: "article",
      entityId: a.id,
      entityTitle: a.title,
    });
  }
  if (due.length || expired.length) logger.info({ published: due.length, unpublished: expired.length }, "Scheduler updated articles");
}

/** Chạy các nguồn RSS đến hạn; tin mới chỉ vào hàng chờ */
async function crawlDueSources(now: Date) {
  const sources = await db
    .select()
    .from(crawlSourcesTable)
    .where(and(eq(crawlSourcesTable.isActive, true), or(isNull(crawlSourcesTable.nextRunAt), lte(crawlSourcesTable.nextRunAt, now))))
    .orderBy(sql`${crawlSourcesTable.nextRunAt} asc nulls first`)
    .limit(5);
  for (const source of sources) {
    const result = await runCrawlSource(source);
    logger.info({ source: source.name, status: result.status, created: result.created }, "Scheduled crawl finished");
  }
}

async function tick() {
  if (running) return;
  running = true;
  const now = new Date();
  try {
    await publishAndUnpublish(now);
  } catch (err) {
    logger.error({ err }, "Scheduler publish step failed");
  }
  try {
    await crawlDueSources(now);
  } catch (err) {
    logger.error({ err }, "Scheduler crawl step failed");
  } finally {
    running = false;
  }
}

export function startScheduler() {
  if (timer) return;
  setTimeout(() => void tick(), 5_000);
  timer = setInterval(() => void tick(), TICK_MS);
  timer.unref();
}
