import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db, articlesTable, categoriesTable, crawlItemsTable, crawlSourcesTable, type CrawlSourceRow } from "@workspace/db";
import {
  CreateCrawlSourceBody,
  CreateCrawlSourceResponse,
  DeleteCrawlSourceParams,
  ImportCrawlItemBody,
  ImportCrawlItemParams,
  ImportCrawlItemResponse,
  ListCrawlItemsQueryParams,
  ListCrawlItemsResponse,
  ListCrawlSourcesResponse,
  RejectCrawlItemParams,
  RejectCrawlItemResponse,
  RunAllCrawlSourcesResponse,
  RunCrawlSourceParams,
  RunCrawlSourceResponse,
  UpdateCrawlSourceBody,
  UpdateCrawlSourceParams,
  UpdateCrawlSourceResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, notFound, paging, parseInput, totalPages } from "../lib/http";
import { logActivity } from "../lib/activity";
import { toCrawlItem, toCrawlSource } from "../lib/serializers";
import { textSearch } from "../lib/search";
import { xmlEscape } from "../lib/text";
import { MAX_CRAWL_SOURCES, runCrawlSource, validateFeedUrl, type CrawlRunResult } from "../lib/crawler";
import { addHistory, articleSlug, assertCategoryExists, buildAdminArticle } from "../lib/articles";

const router: IRouter = Router();

async function sourceCounts(): Promise<Map<number, { pending: number; total: number }>> {
  const rows = await db
    .select({
      sourceId: crawlItemsTable.sourceId,
      total: count(),
      pending: sql<number>`count(*) filter (where ${crawlItemsTable.status} = 'pending')`,
    })
    .from(crawlItemsTable)
    .groupBy(crawlItemsTable.sourceId);
  return new Map(rows.map((r) => [r.sourceId, { pending: Number(r.pending), total: Number(r.total) }]));
}

export async function serializeSources(rows: CrawlSourceRow[]) {
  const [counts, categories] = await Promise.all([
    sourceCounts(),
    db.select({ id: categoriesTable.id, name: categoriesTable.name }).from(categoriesTable),
  ]);
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  return rows.map((r) =>
    toCrawlSource(r, r.categoryId ? (catMap.get(r.categoryId) ?? null) : null, counts.get(r.id) ?? { pending: 0, total: 0 }),
  );
}

const cleanKeywords = (list: string[] | undefined) =>
  list === undefined ? undefined : [...new Set(list.map((k) => k.trim()).filter(Boolean))].slice(0, 30);

function logRun(actor: Parameters<typeof logActivity>[0], results: CrawlRunResult[]) {
  const created = results.reduce((s, r) => s + r.created, 0);
  const errors = results.filter((r) => r.status === "error").length;
  return logActivity(actor, {
    action: "run",
    actionLabel: results.length === 1 ? "Chạy thu thập nguồn tin" : "Chạy thu thập tất cả nguồn tin",
    entityType: "crawl",
    entityId: results.length === 1 ? results[0]!.sourceId : null,
    entityTitle: results.length === 1 ? results[0]!.sourceName : `${results.length} nguồn`,
    detail: `${created} tin mới vào hàng chờ${errors ? `, ${errors} nguồn lỗi` : ""}`,
  });
}

router.get("/admin/crawl-sources", requireRole("admin", "editor"), async (_req, res) => {
  const rows = await db.select().from(crawlSourcesTable).orderBy(asc(crawlSourcesTable.id));
  res.json(ListCrawlSourcesResponse.parse(await serializeSources(rows)));
});

router.post("/admin/crawl-sources", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateCrawlSourceBody, req.body);
  const [existing] = await db.select({ n: count() }).from(crawlSourcesTable);
  if (Number(existing?.n ?? 0) >= MAX_CRAWL_SOURCES) {
    throw badRequest(`Hệ thống chỉ cho phép tối đa ${MAX_CRAWL_SOURCES} nguồn tin tự động. Hãy xóa bớt nguồn cũ trước khi thêm mới.`);
  }
  const url = body.url.trim();
  const urlError = validateFeedUrl(url);
  if (urlError) throw badRequest(urlError);
  await assertCategoryExists(body.categoryId);
  const [row] = await db
    .insert(crawlSourcesTable)
    .values({
      name: body.name.trim(),
      url,
      categoryId: body.categoryId ?? null,
      isActive: body.isActive ?? true,
      intervalMinutes: body.intervalMinutes ?? 60,
      keywords: cleanKeywords(body.keywords) ?? [],
      nextRunAt: new Date(),
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm nguồn tin tự động",
    entityType: "crawl",
    entityId: row!.id,
    entityTitle: row!.name,
    detail: url,
  });
  const [item] = await serializeSources([row!]);
  res.status(201).json(CreateCrawlSourceResponse.parse(item));
});

router.post("/admin/crawl-sources/run-all", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const sources = await db.select().from(crawlSourcesTable).where(eq(crawlSourcesTable.isActive, true)).orderBy(asc(crawlSourcesTable.id));
  if (!sources.length) throw badRequest("Chưa có nguồn tin nào đang bật");
  const results = await Promise.all(sources.map((s) => runCrawlSource(s)));
  await logRun(actor, results);
  res.json(RunAllCrawlSourcesResponse.parse(results));
});

router.patch("/admin/crawl-sources/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateCrawlSourceParams, req.params);
  const body = parseInput(UpdateCrawlSourceBody, req.body);
  const [current] = await db.select().from(crawlSourcesTable).where(eq(crawlSourcesTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy nguồn tin");
  const url = body.url?.trim() ?? current.url;
  const urlError = validateFeedUrl(url);
  if (urlError) throw badRequest(urlError);
  if (body.categoryId !== undefined) await assertCategoryExists(body.categoryId);
  const intervalMinutes = body.intervalMinutes ?? current.intervalMinutes;
  const reactivated = body.isActive === true && !current.isActive;
  const [row] = await db
    .update(crawlSourcesTable)
    .set({
      name: body.name?.trim() ?? current.name,
      url,
      categoryId: body.categoryId === undefined ? current.categoryId : body.categoryId,
      isActive: body.isActive ?? current.isActive,
      intervalMinutes,
      keywords: cleanKeywords(body.keywords) ?? current.keywords,
      nextRunAt:
        reactivated || url !== current.url
          ? new Date()
          : current.lastRunAt
            ? new Date(current.lastRunAt.getTime() + intervalMinutes * 60_000)
            : current.nextRunAt,
    })
    .where(eq(crawlSourcesTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: body.isActive === false && current.isActive ? "Tạm dừng nguồn tin tự động" : "Cập nhật nguồn tin tự động",
    entityType: "crawl",
    entityId: id,
    entityTitle: row!.name,
  });
  const [item] = await serializeSources([row!]);
  res.json(UpdateCrawlSourceResponse.parse(item));
});

router.delete("/admin/crawl-sources/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteCrawlSourceParams, req.params);
  const [current] = await db.select().from(crawlSourcesTable).where(eq(crawlSourcesTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy nguồn tin");
  await db.delete(crawlSourcesTable).where(eq(crawlSourcesTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa nguồn tin tự động",
    entityType: "crawl",
    entityId: id,
    entityTitle: current.name,
  });
  res.status(204).end();
});

router.post("/admin/crawl-sources/:id/run", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(RunCrawlSourceParams, req.params);
  const [source] = await db.select().from(crawlSourcesTable).where(eq(crawlSourcesTable.id, id)).limit(1);
  if (!source) throw notFound("Không tìm thấy nguồn tin");
  const result = await runCrawlSource(source);
  await logRun(actor, [result]);
  res.json(RunCrawlSourceResponse.parse(result));
});

router.get("/admin/crawl-items", requireRole("admin", "editor"), async (req, res) => {
  const query = parseInput(ListCrawlItemsQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 20);
  const base = and(
    query.sourceId ? eq(crawlItemsTable.sourceId, query.sourceId) : undefined,
    textSearch(query.q, [crawlItemsTable.title, crawlItemsTable.summary]),
  );
  const where = and(base, query.status ? eq(crawlItemsTable.status, query.status) : undefined);
  const [rows, [totalRow], statusRows, sources] = await Promise.all([
    db
      .select()
      .from(crawlItemsTable)
      .where(where)
      .orderBy(desc(crawlItemsTable.fetchedAt), sql`${crawlItemsTable.publishedAt} desc nulls last`, desc(crawlItemsTable.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(crawlItemsTable).where(where),
    db.select({ status: crawlItemsTable.status, n: count() }).from(crawlItemsTable).where(base).groupBy(crawlItemsTable.status),
    db.select({ id: crawlSourcesTable.id, name: crawlSourcesTable.name }).from(crawlSourcesTable),
  ]);
  const names = new Map(sources.map((s) => [s.id, s.name]));
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListCrawlItemsResponse.parse({
      items: rows.map((r) => toCrawlItem(r, names.get(r.sourceId) ?? "Nguồn đã xóa")),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
      statusCounts: statusRows.map((s) => ({ status: s.status, count: Number(s.n) })),
    }),
  );
});

router.post("/admin/crawl-items/:id/import", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(ImportCrawlItemParams, req.params);
  const body = parseInput(ImportCrawlItemBody, req.body ?? {});
  const [item] = await db.select().from(crawlItemsTable).where(eq(crawlItemsTable.id, id)).limit(1);
  if (!item) throw notFound("Không tìm thấy tin trong hàng chờ");
  if (item.status === "imported") throw badRequest("Tin này đã được chuyển thành bài nháp");
  const [source] = await db.select().from(crawlSourcesTable).where(eq(crawlSourcesTable.id, item.sourceId)).limit(1);
  const categoryId = body.categoryId === undefined || body.categoryId === null ? (source?.categoryId ?? null) : body.categoryId;
  await assertCategoryExists(categoryId);
  const sourceName = source?.name ?? "Nguồn tin tự động";
  // Chỉ lấy tiêu đề, tóm tắt và đường dẫn gốc; biên tập viên viết lại nội dung trước khi gửi duyệt
  const content = [
    item.summary ? `<p>${xmlEscape(item.summary)}</p>` : "",
    `<p><em>Biên tập viên cần viết lại, bổ sung nội dung và kiểm tra bản quyền hình ảnh trước khi gửi duyệt.</em></p>`,
    `<p>Nguồn: <a href="${xmlEscape(item.link)}" target="_blank" rel="noopener noreferrer">${xmlEscape(sourceName)}</a></p>`,
  ].join("");
  const [article] = await db
    .insert(articlesTable)
    .values({
      title: item.title,
      slug: await articleSlug(item.title),
      summary: item.summary ?? "",
      content,
      status: "draft",
      categoryId,
      language: "vi",
      coverImage: item.imageUrl,
      sourceName,
      sourceUrl: item.link,
      keywords: item.matchedKeywords,
      createdById: actor.id,
      origin: "crawler",
    })
    .returning();
  await db.update(crawlItemsTable).set({ status: "imported", articleId: article!.id }).where(eq(crawlItemsTable.id, id));
  await addHistory(article!.id, actor, {
    action: "create",
    fromStatus: null,
    toStatus: "draft",
    note: `Tạo từ tin tự động (${sourceName})`,
  });
  await logActivity(actor, {
    action: "import",
    actionLabel: "Chuyển tin tự động thành bài nháp",
    entityType: "crawl",
    entityId: article!.id,
    entityTitle: article!.title,
    detail: sourceName,
  });
  res.status(201).json(ImportCrawlItemResponse.parse(await buildAdminArticle(article!, actor)));
});

router.post("/admin/crawl-items/:id/reject", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(RejectCrawlItemParams, req.params);
  const [item] = await db.select().from(crawlItemsTable).where(eq(crawlItemsTable.id, id)).limit(1);
  if (!item) throw notFound("Không tìm thấy tin trong hàng chờ");
  if (item.status === "imported") throw badRequest("Tin đã được chuyển thành bài nháp, không thể loại bỏ");
  const [row] = await db.update(crawlItemsTable).set({ status: "rejected" }).where(eq(crawlItemsTable.id, id)).returning();
  const [source] = await db
    .select({ name: crawlSourcesTable.name })
    .from(crawlSourcesTable)
    .where(eq(crawlSourcesTable.id, item.sourceId))
    .limit(1);
  await logActivity(actor, {
    action: "reject",
    actionLabel: "Loại bỏ tin tự động",
    entityType: "crawl",
    entityId: id,
    entityTitle: item.title,
  });
  res.json(RejectCrawlItemResponse.parse(toCrawlItem(row!, source?.name ?? "Nguồn đã xóa")));
});

export default router;
