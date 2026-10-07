import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, ne, notInArray, sql, type SQL } from "drizzle-orm";
import { db, activityFieldsTable, datasetsTable, evaluationServicesTable } from "@workspace/db";
import {
  CreateDatasetBody,
  CreateDatasetResponse,
  DeleteDatasetParams,
  GetDatasetParams,
  GetDatasetResponse,
  GetDatasetStatsResponse,
  GetEvaluationServiceParams,
  GetEvaluationServiceResponse,
  ListDatasetsQueryParams,
  ListDatasetsResponse,
  ListEvaluationServicesResponse,
  RecordDatasetAccessBody,
  RecordDatasetAccessParams,
  RecordDatasetAccessResponse,
  UpdateDatasetBody,
  UpdateDatasetParams,
  UpdateDatasetResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, forbidden, notFound, parseInput } from "../lib/http";
import { logActivity } from "../lib/activity";
import { loadLookups, toDataset, toService } from "../lib/serializers";
import { cleanHtml, slugify, uniqueSlug } from "../lib/text";
import { arrayText, textSearch } from "../lib/search";

const router: IRouter = Router();

const ACCESS_LABEL: Record<string, string> = {
  open: "Mở",
  registered: "Cần đăng ký",
  restricted: "Hạn chế",
};

router.get("/datasets", async (req, res) => {
  const query = parseInput(ListDatasetsQueryParams, req.query);
  const where = and(
    query.fieldId ? eq(datasetsTable.fieldId, query.fieldId) : undefined,
    query.accessLevel ? eq(datasetsTable.accessLevel, query.accessLevel) : undefined,
    textSearch(query.q, [
      datasetsTable.title,
      datasetsTable.summary,
      datasetsTable.publisher,
      arrayText(datasetsTable.keywords),
      arrayText(datasetsTable.aiTasks),
    ]),
  );
  const [lk, rows] = await Promise.all([
    loadLookups(),
    db.select().from(datasetsTable).where(where).orderBy(desc(datasetsTable.updatedAt), desc(datasetsTable.id)),
  ]);
  res.json(ListDatasetsResponse.parse(rows.map((r) => toDataset(r, lk))));
});

router.get("/datasets/stats", async (_req, res) => {
  const [[totals], levelRows, fieldRows, formatRows] = await Promise.all([
    db
      .select({
        total: count(),
        records: sql<number>`coalesce(sum(${datasetsTable.recordCount}), 0)`,
        downloads: sql<number>`coalesce(sum(${datasetsTable.downloadCount}), 0)`,
        requests: sql<number>`coalesce(sum(${datasetsTable.requestCount}), 0)`,
      })
      .from(datasetsTable),
    db.select({ level: datasetsTable.accessLevel, n: count() }).from(datasetsTable).groupBy(datasetsTable.accessLevel),
    db
      .select({ name: activityFieldsTable.shortName, n: count() })
      .from(datasetsTable)
      .innerJoin(activityFieldsTable, eq(datasetsTable.fieldId, activityFieldsTable.id))
      .groupBy(activityFieldsTable.shortName)
      .orderBy(desc(count())),
    db.execute<{ label: string; n: string }>(
      sql`select f as label, count(*) as n from ${datasetsTable}, unnest(${datasetsTable.formats}) as f group by f order by count(*) desc, f`,
    ),
  ]);
  res.json(
    GetDatasetStatsResponse.parse({
      total: Number(totals?.total ?? 0),
      totalRecords: Number(totals?.records ?? 0),
      totalDownloads: Number(totals?.downloads ?? 0),
      totalRequests: Number(totals?.requests ?? 0),
      byAccessLevel: levelRows.map((l) => ({ status: l.level, count: Number(l.n) })),
      byField: fieldRows.map((f) => ({ label: f.name, count: Number(f.n) })),
      formats: formatRows.rows.map((f) => ({ label: f.label, count: Number(f.n) })),
    }),
  );
});

router.get("/datasets/:slug", async (req, res) => {
  const { slug } = parseInput(GetDatasetParams, req.params);
  const [row] = await db.select().from(datasetsTable).where(eq(datasetsTable.slug, slug)).limit(1);
  if (!row) throw notFound("Không tìm thấy bộ dữ liệu");
  const lk = await loadLookups();
  const related = row.fieldId
    ? await db
        .select()
        .from(datasetsTable)
        .where(and(eq(datasetsTable.fieldId, row.fieldId), ne(datasetsTable.id, row.id)))
        .orderBy(desc(datasetsTable.downloadCount))
        .limit(3)
    : [];
  if (related.length < 3) {
    const more = await db
      .select()
      .from(datasetsTable)
      .where(notInArray(datasetsTable.id, [row.id, ...related.map((r) => r.id)]))
      .orderBy(desc(datasetsTable.downloadCount))
      .limit(3 - related.length);
    related.push(...more);
  }
  res.json(GetDatasetResponse.parse({ dataset: toDataset(row, lk), related: related.map((r) => toDataset(r, lk)) }));
});

router.post("/datasets/:id/access", async (req, res) => {
  const { id } = parseInput(RecordDatasetAccessParams, req.params);
  const body = parseInput(RecordDatasetAccessBody, req.body);
  const [row] = await db.select().from(datasetsTable).where(eq(datasetsTable.id, id)).limit(1);
  if (!row) throw notFound("Không tìm thấy bộ dữ liệu");
  if (row.accessLevel === "restricted") {
    throw forbidden("Bộ dữ liệu này cần được Viện phê duyệt trước khi khai thác. Vui lòng gửi yêu cầu khai thác dữ liệu.");
  }
  const method = row.accessMethods.find((m) => m.type === body.method);
  if (!method) throw badRequest("Bộ dữ liệu không hỗ trợ phương thức truy cập này");
  const [updated] = await db
    .update(datasetsTable)
    .set({ downloadCount: sql`${datasetsTable.downloadCount} + 1` })
    .where(eq(datasetsTable.id, id))
    .returning({ downloadCount: datasetsTable.downloadCount });
  res.json(RecordDatasetAccessResponse.parse({ url: method.url, downloadCount: updated?.downloadCount ?? row.downloadCount + 1 }));
});

async function datasetSlug(input: string, excludeId?: number) {
  return uniqueSlug(slugify(input, "du-lieu"), async (slug) => {
    const rows = await db
      .select({ id: datasetsTable.id })
      .from(datasetsTable)
      .where(excludeId ? and(eq(datasetsTable.slug, slug), ne(datasetsTable.id, excludeId)) : eq(datasetsTable.slug, slug))
      .limit(1);
    return rows.length > 0;
  });
}

async function assertField(fieldId: number | null | undefined) {
  if (fieldId == null) return;
  const rows = await db.select({ id: activityFieldsTable.id }).from(activityFieldsTable).where(eq(activityFieldsTable.id, fieldId)).limit(1);
  if (!rows.length) throw badRequest("Lĩnh vực không tồn tại");
}

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

router.post("/admin/datasets", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateDatasetBody, req.body);
  await assertField(body.fieldId);
  const [row] = await db
    .insert(datasetsTable)
    .values({
      slug: await datasetSlug(body.slug?.trim() || body.title),
      title: body.title.trim(),
      summary: body.summary.trim(),
      description: cleanHtml(body.description),
      fieldId: body.fieldId ?? null,
      publisher: body.publisher?.trim() ?? "",
      contactEmail: body.contactEmail?.trim() ?? "",
      license: body.license?.trim() ?? "",
      accessLevel: body.accessLevel,
      accessMethods: body.accessMethods ?? [],
      formats: body.formats ?? [],
      sizeLabel: body.sizeLabel?.trim() ?? "",
      recordCount: body.recordCount ?? 0,
      language: body.language?.trim() || "Tiếng Việt",
      updateFrequency: body.updateFrequency?.trim() ?? "",
      version: body.version?.trim() || "1.0",
      keywords: body.keywords ?? [],
      aiTasks: body.aiTasks ?? [],
      conditions: body.conditions?.trim() ?? "",
      columns: body.columns ?? [],
      coverImage: body.coverImage?.trim() || null,
      issuedDate: body.issuedDate ?? today(),
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm bộ dữ liệu",
    entityType: "dataset",
    entityId: row!.id,
    entityTitle: row!.title,
    detail: `Mức truy cập: ${ACCESS_LABEL[row!.accessLevel] ?? row!.accessLevel}`,
  });
  res.status(201).json(CreateDatasetResponse.parse(toDataset(row!, await loadLookups())));
});

router.patch("/admin/datasets/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateDatasetParams, req.params);
  const body = parseInput(UpdateDatasetBody, req.body);
  const [current] = await db.select().from(datasetsTable).where(eq(datasetsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy bộ dữ liệu");
  if (body.fieldId !== undefined) await assertField(body.fieldId);
  const slug =
    body.slug !== undefined && body.slug.trim() && body.slug.trim() !== current.slug
      ? await datasetSlug(body.slug.trim(), id)
      : current.slug;
  const [row] = await db
    .update(datasetsTable)
    .set({
      slug,
      title: body.title?.trim() ?? current.title,
      summary: body.summary?.trim() ?? current.summary,
      description: body.description === undefined ? current.description : cleanHtml(body.description),
      fieldId: body.fieldId === undefined ? current.fieldId : body.fieldId,
      publisher: body.publisher?.trim() ?? current.publisher,
      contactEmail: body.contactEmail?.trim() ?? current.contactEmail,
      license: body.license?.trim() ?? current.license,
      accessLevel: body.accessLevel ?? current.accessLevel,
      accessMethods: body.accessMethods ?? current.accessMethods,
      formats: body.formats ?? current.formats,
      sizeLabel: body.sizeLabel?.trim() ?? current.sizeLabel,
      recordCount: body.recordCount ?? current.recordCount,
      language: body.language?.trim() || current.language,
      updateFrequency: body.updateFrequency?.trim() ?? current.updateFrequency,
      version: body.version?.trim() || current.version,
      keywords: body.keywords ?? current.keywords,
      aiTasks: body.aiTasks ?? current.aiTasks,
      conditions: body.conditions?.trim() ?? current.conditions,
      columns: body.columns ?? current.columns,
      coverImage: body.coverImage === undefined ? current.coverImage : body.coverImage?.trim() || null,
      issuedDate: body.issuedDate ?? current.issuedDate,
      updatedAt: new Date(),
    })
    .where(eq(datasetsTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật bộ dữ liệu",
    entityType: "dataset",
    entityId: id,
    entityTitle: row!.title,
  });
  res.json(UpdateDatasetResponse.parse(toDataset(row!, await loadLookups())));
});

router.delete("/admin/datasets/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteDatasetParams, req.params);
  const [current] = await db.select().from(datasetsTable).where(eq(datasetsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy bộ dữ liệu");
  await db.delete(datasetsTable).where(eq(datasetsTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa bộ dữ liệu",
    entityType: "dataset",
    entityId: id,
    entityTitle: current.title,
  });
  res.status(204).end();
});

/* -------------------- Dịch vụ đánh giá, kiểm định -------------------- */

router.get("/evaluation-services", async (_req, res) => {
  const [lk, rows] = await Promise.all([
    loadLookups(),
    db.select().from(evaluationServicesTable).orderBy(asc(evaluationServicesTable.sortOrder), asc(evaluationServicesTable.id)),
  ]);
  res.json(ListEvaluationServicesResponse.parse(rows.map((r) => toService(r, lk))));
});

router.get("/evaluation-services/:slug", async (req, res) => {
  const { slug } = parseInput(GetEvaluationServiceParams, req.params);
  const [row] = await db.select().from(evaluationServicesTable).where(eq(evaluationServicesTable.slug, slug)).limit(1);
  if (!row) throw notFound("Không tìm thấy dịch vụ");
  res.json(GetEvaluationServiceResponse.parse(toService(row, await loadLookups())));
});

export default router;
