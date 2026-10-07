import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, ne, sql, type SQL } from "drizzle-orm";
import {
  db,
  activityFieldsTable,
  articlesTable,
  datasetsTable,
  documentsTable,
  evaluationServicesTable,
  projectsTable,
  publicationsTable,
  type ProjectRow,
} from "@workspace/db";
import {
  CreateProjectBody,
  CreateProjectResponse,
  CreatePublicationBody,
  CreatePublicationResponse,
  DeleteProjectParams,
  DeletePublicationParams,
  GetFieldParams,
  GetFieldResponse,
  GetProjectParams,
  GetProjectResponse,
  ListFieldsResponse,
  ListProjectsQueryParams,
  ListProjectsResponse,
  ListPublicationsQueryParams,
  ListPublicationsResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
  UpdatePublicationBody,
  UpdatePublicationParams,
  UpdatePublicationResponse,
} from "@workspace/api-zod";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, notFound, paging, parseInput, totalPages } from "../lib/http";
import { logActivity } from "../lib/activity";
import {
  loadLookups,
  toArticleSummary,
  toDataset,
  toDocument,
  toField,
  toProject,
  toPublication,
  toService,
  type FieldCounts,
} from "../lib/serializers";
import { slugify, uniqueSlug } from "../lib/text";
import { arrayText, textSearch } from "../lib/search";
import { publicArticleCondition } from "../lib/visibility";

const router: IRouter = Router();

/* --------------------------- Lĩnh vực --------------------------- */

async function countByField(column: AnyPgColumn, table: PgTable) {
  const rows = await db.select({ fieldId: column, n: count() }).from(table).groupBy(column);
  return new Map(rows.filter((r) => r.fieldId != null).map((r) => [Number(r.fieldId), Number(r.n)]));
}

async function fieldCounts(): Promise<(fieldId: number) => FieldCounts> {
  const [projects, publications, datasets, services, documents] = await Promise.all([
    countByField(projectsTable.fieldId, projectsTable),
    countByField(publicationsTable.fieldId, publicationsTable),
    countByField(datasetsTable.fieldId, datasetsTable),
    countByField(evaluationServicesTable.fieldId, evaluationServicesTable),
    countByField(documentsTable.fieldId, documentsTable),
  ]);
  return (id) => ({
    projectCount: projects.get(id) ?? 0,
    publicationCount: publications.get(id) ?? 0,
    datasetCount: datasets.get(id) ?? 0,
    serviceCount: services.get(id) ?? 0,
    documentCount: documents.get(id) ?? 0,
  });
}

router.get("/fields", async (_req, res) => {
  const [rows, counts] = await Promise.all([
    db.select().from(activityFieldsTable).orderBy(asc(activityFieldsTable.sortOrder), asc(activityFieldsTable.id)),
    fieldCounts(),
  ]);
  res.json(ListFieldsResponse.parse(rows.map((f) => toField(f, counts(f.id)))));
});

async function projectRefs(): Promise<Map<number, Pick<ProjectRow, "title" | "slug">>> {
  const rows = await db.select({ id: projectsTable.id, title: projectsTable.title, slug: projectsTable.slug }).from(projectsTable);
  return new Map(rows.map((p) => [p.id, p]));
}

router.get("/fields/:slug", async (req, res) => {
  const { slug } = parseInput(GetFieldParams, req.params);
  const [field] = await db.select().from(activityFieldsTable).where(eq(activityFieldsTable.slug, slug)).limit(1);
  if (!field) throw notFound("Không tìm thấy lĩnh vực");
  const [lk, counts, refs] = await Promise.all([loadLookups(), fieldCounts(), projectRefs()]);
  const terms = [field.shortName, field.name];
  const [projects, publications, datasets, services, articles, documents] = await Promise.all([
    db.select().from(projectsTable).where(eq(projectsTable.fieldId, field.id)).orderBy(desc(projectsTable.startYear)).limit(6),
    db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.fieldId, field.id))
      .orderBy(desc(publicationsTable.year), desc(publicationsTable.id))
      .limit(6),
    db.select().from(datasetsTable).where(eq(datasetsTable.fieldId, field.id)).orderBy(desc(datasetsTable.downloadCount)),
    db
      .select()
      .from(evaluationServicesTable)
      .where(eq(evaluationServicesTable.fieldId, field.id))
      .orderBy(asc(evaluationServicesTable.sortOrder)),
    db
      .select()
      .from(articlesTable)
      .where(
        and(
          publicArticleCondition(),
          eq(articlesTable.language, "vi"),
          sql`(${sql.join(
            terms.map((t) => textSearch(t, [articlesTable.title, arrayText(articlesTable.keywords), arrayText(articlesTable.tags)])!),
            sql` or `,
          )})`,
        ),
      )
      .orderBy(desc(articlesTable.publishedAt))
      .limit(4),
    db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.fieldId, field.id))
      .orderBy(desc(documentsTable.issuedDate))
      .limit(5),
  ]);
  res.json(
    GetFieldResponse.parse({
      field: toField(field, counts(field.id)),
      projects: projects.map((p) => toProject(p, lk)),
      publications: publications.map((p) => toPublication(p, lk, refs)),
      datasets: datasets.map((d) => toDataset(d, lk)),
      services: services.map((s) => toService(s, lk)),
      articles: articles.map((a) => toArticleSummary(a, lk)),
      documents: documents.map((d) => toDocument(d, lk)),
    }),
  );
});

/* ------------------------- Đề tài, dự án ------------------------- */

router.get("/projects", async (req, res) => {
  const query = parseInput(ListProjectsQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 9);
  const base: (SQL | undefined)[] = [
    query.fieldId ? eq(projectsTable.fieldId, query.fieldId) : undefined,
    textSearch(query.q, [
      projectsTable.title,
      projectsTable.code,
      projectsTable.summary,
      projectsTable.leadName,
      arrayText(projectsTable.keywords),
    ]),
  ];
  const where = and(...base, query.status ? eq(projectsTable.status, query.status) : undefined);
  const [lk, rows, [totalRow], statusRows] = await Promise.all([
    loadLookups(),
    db
      .select()
      .from(projectsTable)
      .where(where)
      .orderBy(
        sql`case ${projectsTable.status} when 'ongoing' then 0 when 'proposed' then 1 else 2 end`,
        desc(projectsTable.startYear),
        desc(projectsTable.id),
      )
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(projectsTable).where(where),
    db.select({ status: projectsTable.status, n: count() }).from(projectsTable).where(and(...base)).groupBy(projectsTable.status),
  ]);
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListProjectsResponse.parse({
      items: rows.map((r) => toProject(r, lk)),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
      statusCounts: statusRows.map((s) => ({ status: s.status, count: Number(s.n) })),
    }),
  );
});

router.get("/projects/:slug", async (req, res) => {
  const { slug } = parseInput(GetProjectParams, req.params);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
  if (!project) throw notFound("Không tìm thấy đề tài, dự án");
  const [lk, refs, publications, documents, related] = await Promise.all([
    loadLookups(),
    projectRefs(),
    db
      .select()
      .from(publicationsTable)
      .where(eq(publicationsTable.projectId, project.id))
      .orderBy(desc(publicationsTable.year)),
    db.select().from(documentsTable).where(eq(documentsTable.projectId, project.id)).orderBy(desc(documentsTable.issuedDate)),
    project.fieldId
      ? db
          .select()
          .from(projectsTable)
          .where(and(eq(projectsTable.fieldId, project.fieldId), ne(projectsTable.id, project.id)))
          .orderBy(desc(projectsTable.startYear))
          .limit(3)
      : Promise.resolve([] as ProjectRow[]),
  ]);
  res.json(
    GetProjectResponse.parse({
      project: toProject(project, lk),
      publications: publications.map((p) => toPublication(p, lk, refs)),
      documents: documents.map((d) => toDocument(d, lk)),
      related: related.map((p) => toProject(p, lk)),
    }),
  );
});

async function projectSlug(input: string, excludeId?: number) {
  return uniqueSlug(slugify(input, "de-tai"), async (slug) => {
    const rows = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(excludeId ? and(eq(projectsTable.slug, slug), ne(projectsTable.id, excludeId)) : eq(projectsTable.slug, slug))
      .limit(1);
    return rows.length > 0;
  });
}

async function assertField(fieldId: number | null | undefined) {
  if (fieldId == null) return;
  const rows = await db.select({ id: activityFieldsTable.id }).from(activityFieldsTable).where(eq(activityFieldsTable.id, fieldId)).limit(1);
  if (!rows.length) throw badRequest("Lĩnh vực không tồn tại");
}

async function assertProject(projectId: number | null | undefined) {
  if (projectId == null) return;
  const rows = await db.select({ id: projectsTable.id }).from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
  if (!rows.length) throw badRequest("Đề tài, dự án không tồn tại");
}

function checkYears(startYear: number, endYear: number | null | undefined) {
  if (endYear != null && endYear < startYear) throw badRequest("Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu");
}

router.post("/admin/projects", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateProjectBody, req.body);
  await assertField(body.fieldId);
  checkYears(body.startYear, body.endYear);
  const [row] = await db
    .insert(projectsTable)
    .values({
      slug: await projectSlug(body.slug?.trim() || body.title),
      code: body.code.trim(),
      title: body.title.trim(),
      type: body.type.trim(),
      level: body.level.trim(),
      status: body.status,
      fieldId: body.fieldId ?? null,
      leadName: body.leadName.trim(),
      leadUnit: body.leadUnit?.trim() ?? "",
      startYear: body.startYear,
      endYear: body.endYear ?? null,
      budget: body.budget?.trim() || null,
      summary: body.summary?.trim() ?? "",
      objectives: body.objectives ?? [],
      results: body.results?.trim() || null,
      partners: body.partners ?? [],
      milestones: body.milestones ?? [],
      keywords: body.keywords ?? [],
      coverImage: body.coverImage?.trim() || null,
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm đề tài, dự án",
    entityType: "project",
    entityId: row!.id,
    entityTitle: row!.title,
  });
  res.status(201).json(CreateProjectResponse.parse(toProject(row!, await loadLookups())));
});

router.patch("/admin/projects/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateProjectParams, req.params);
  const body = parseInput(UpdateProjectBody, req.body);
  const [current] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy đề tài, dự án");
  if (body.fieldId !== undefined) await assertField(body.fieldId);
  const startYear = body.startYear ?? current.startYear;
  const endYear = body.endYear === undefined ? current.endYear : body.endYear;
  checkYears(startYear, endYear);
  const slug =
    body.slug !== undefined && body.slug.trim() && body.slug.trim() !== current.slug
      ? await projectSlug(body.slug.trim(), id)
      : current.slug;
  const [row] = await db
    .update(projectsTable)
    .set({
      slug,
      code: body.code?.trim() ?? current.code,
      title: body.title?.trim() ?? current.title,
      type: body.type?.trim() ?? current.type,
      level: body.level?.trim() ?? current.level,
      status: body.status ?? current.status,
      fieldId: body.fieldId === undefined ? current.fieldId : body.fieldId,
      leadName: body.leadName?.trim() ?? current.leadName,
      leadUnit: body.leadUnit?.trim() ?? current.leadUnit,
      startYear,
      endYear,
      budget: body.budget === undefined ? current.budget : body.budget?.trim() || null,
      summary: body.summary?.trim() ?? current.summary,
      objectives: body.objectives ?? current.objectives,
      results: body.results === undefined ? current.results : body.results?.trim() || null,
      partners: body.partners ?? current.partners,
      milestones: body.milestones ?? current.milestones,
      keywords: body.keywords ?? current.keywords,
      coverImage: body.coverImage === undefined ? current.coverImage : body.coverImage?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật đề tài, dự án",
    entityType: "project",
    entityId: id,
    entityTitle: row!.title,
  });
  res.json(UpdateProjectResponse.parse(toProject(row!, await loadLookups())));
});

router.delete("/admin/projects/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteProjectParams, req.params);
  const [current] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy đề tài, dự án");
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa đề tài, dự án",
    entityType: "project",
    entityId: id,
    entityTitle: current.title,
  });
  res.status(204).end();
});

/* ------------------------ Công bố khoa học ------------------------ */

router.get("/publications", async (req, res) => {
  const query = parseInput(ListPublicationsQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 10);
  const shared: (SQL | undefined)[] = [
    query.fieldId ? eq(publicationsTable.fieldId, query.fieldId) : undefined,
    query.year ? eq(publicationsTable.year, query.year) : undefined,
    textSearch(query.q, [
      publicationsTable.title,
      publicationsTable.authors,
      publicationsTable.venue,
      publicationsTable.abstract,
      arrayText(publicationsTable.keywords),
    ]),
  ];
  const where = and(...shared, query.type ? eq(publicationsTable.type, query.type) : undefined);
  const [lk, refs, rows, [totalRow], typeRows, yearRows] = await Promise.all([
    loadLookups(),
    projectRefs(),
    db
      .select()
      .from(publicationsTable)
      .where(where)
      .orderBy(desc(publicationsTable.year), desc(publicationsTable.citationCount), desc(publicationsTable.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(publicationsTable).where(where),
    db.select({ type: publicationsTable.type, n: count() }).from(publicationsTable).where(and(...shared)).groupBy(publicationsTable.type),
    db.selectDistinct({ year: publicationsTable.year }).from(publicationsTable).orderBy(desc(publicationsTable.year)),
  ]);
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListPublicationsResponse.parse({
      items: rows.map((r) => toPublication(r, lk, refs)),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
      years: yearRows.map((y) => y.year),
      typeCounts: typeRows.map((t) => ({ status: t.type, count: Number(t.n) })),
    }),
  );
});

router.post("/admin/publications", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreatePublicationBody, req.body);
  await Promise.all([assertField(body.fieldId), assertProject(body.projectId)]);
  const [row] = await db
    .insert(publicationsTable)
    .values({
      title: body.title.trim(),
      authors: body.authors.trim(),
      venue: body.venue.trim(),
      type: body.type,
      year: body.year,
      doi: body.doi?.trim() || null,
      url: body.url?.trim() || null,
      abstract: body.abstract?.trim() ?? "",
      keywords: body.keywords ?? [],
      indexing: body.indexing?.trim() || null,
      isInternational: body.isInternational ?? false,
      citationCount: body.citationCount ?? 0,
      fieldId: body.fieldId ?? null,
      projectId: body.projectId ?? null,
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm công bố khoa học",
    entityType: "publication",
    entityId: row!.id,
    entityTitle: row!.title,
  });
  res.status(201).json(CreatePublicationResponse.parse(toPublication(row!, await loadLookups(), await projectRefs())));
});

router.patch("/admin/publications/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdatePublicationParams, req.params);
  const body = parseInput(UpdatePublicationBody, req.body);
  const [current] = await db.select().from(publicationsTable).where(eq(publicationsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy công bố");
  await Promise.all([
    body.fieldId !== undefined ? assertField(body.fieldId) : undefined,
    body.projectId !== undefined ? assertProject(body.projectId) : undefined,
  ]);
  const [row] = await db
    .update(publicationsTable)
    .set({
      title: body.title?.trim() ?? current.title,
      authors: body.authors?.trim() ?? current.authors,
      venue: body.venue?.trim() ?? current.venue,
      type: body.type ?? current.type,
      year: body.year ?? current.year,
      doi: body.doi === undefined ? current.doi : body.doi?.trim() || null,
      url: body.url === undefined ? current.url : body.url?.trim() || null,
      abstract: body.abstract?.trim() ?? current.abstract,
      keywords: body.keywords ?? current.keywords,
      indexing: body.indexing === undefined ? current.indexing : body.indexing?.trim() || null,
      isInternational: body.isInternational ?? current.isInternational,
      citationCount: body.citationCount ?? current.citationCount,
      fieldId: body.fieldId === undefined ? current.fieldId : body.fieldId,
      projectId: body.projectId === undefined ? current.projectId : body.projectId,
    })
    .where(eq(publicationsTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật công bố khoa học",
    entityType: "publication",
    entityId: id,
    entityTitle: row!.title,
  });
  res.json(UpdatePublicationResponse.parse(toPublication(row!, await loadLookups(), await projectRefs())));
});

router.delete("/admin/publications/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeletePublicationParams, req.params);
  const [current] = await db.select().from(publicationsTable).where(eq(publicationsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy công bố");
  await db.delete(publicationsTable).where(eq(publicationsTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa công bố khoa học",
    entityType: "publication",
    entityId: id,
    entityTitle: current.title,
  });
  res.status(204).end();
});

export default router;
