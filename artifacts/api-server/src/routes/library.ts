import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, ne, sql, type SQL } from "drizzle-orm";
import { db, albumsTable, documentsTable, leadersTable, orgUnitsTable, projectsTable, activityFieldsTable } from "@workspace/db";
import {
  CreateAlbumBody,
  CreateAlbumResponse,
  CreateDocumentBody,
  CreateDocumentResponse,
  DeleteAlbumParams,
  DeleteDocumentParams,
  GetAlbumParams,
  GetAlbumResponse,
  GetDocumentParams,
  GetDocumentResponse,
  ListAlbumsQueryParams,
  ListAlbumsResponse,
  ListDocumentsQueryParams,
  ListDocumentsResponse,
  ListLeadersResponse,
  ListOrgUnitsResponse,
  RecordDocumentDownloadParams,
  RecordDocumentDownloadResponse,
  UpdateAlbumBody,
  UpdateAlbumParams,
  UpdateAlbumResponse,
  UpdateDocumentBody,
  UpdateDocumentParams,
  UpdateDocumentResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, notFound, paging, parseInput, totalPages } from "../lib/http";
import { logActivity } from "../lib/activity";
import { loadLookups, toAlbum, toDocument, toLeader, toOrgUnit } from "../lib/serializers";
import { slugify, uniqueSlug } from "../lib/text";
import { textSearch } from "../lib/search";

const router: IRouter = Router();

export const DOC_GROUP_LABEL: Record<string, string> = {
  legal: "Văn bản quy phạm pháp luật",
  direction: "Văn bản chỉ đạo, điều hành",
  guidance: "Văn bản hướng dẫn",
  report: "Báo cáo",
  standard: "Tiêu chuẩn, quy chuẩn",
  form: "Biểu mẫu",
};

/* ------------------------- Văn bản, tài liệu ------------------------- */

const yearOf = sql<string>`substring(${documentsTable.issuedDate} from 1 for 4)`;

router.get("/documents", async (req, res) => {
  const query = parseInput(ListDocumentsQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 15);
  const base: (SQL | undefined)[] = [
    query.fieldId ? eq(documentsTable.fieldId, query.fieldId) : undefined,
    textSearch(query.q, [
      documentsTable.number,
      documentsTable.title,
      documentsTable.summary,
      documentsTable.issuer,
      documentsTable.signer,
    ]),
  ];
  const where = and(
    ...base,
    query.docGroup ? eq(documentsTable.docGroup, query.docGroup) : undefined,
    query.docType ? eq(documentsTable.docType, query.docType) : undefined,
    query.issuer ? eq(documentsTable.issuer, query.issuer) : undefined,
    query.year ? sql`${yearOf} = ${String(query.year)}` : undefined,
  );
  const order =
    query.sort === "oldest"
      ? [asc(documentsTable.issuedDate), asc(documentsTable.id)]
      : query.sort === "downloads"
        ? [desc(documentsTable.downloadCount), desc(documentsTable.issuedDate)]
        : [desc(documentsTable.issuedDate), desc(documentsTable.id)];
  const baseWhere = and(...base);
  const [lk, rows, [totalRow], groups, types, issuers, years] = await Promise.all([
    loadLookups(),
    db.select().from(documentsTable).where(where).orderBy(...order).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(documentsTable).where(where),
    db.select({ v: documentsTable.docGroup, n: count() }).from(documentsTable).where(baseWhere).groupBy(documentsTable.docGroup),
    db
      .select({ v: documentsTable.docType, n: count() })
      .from(documentsTable)
      .where(baseWhere)
      .groupBy(documentsTable.docType)
      .orderBy(desc(count())),
    db
      .select({ v: documentsTable.issuer, n: count() })
      .from(documentsTable)
      .where(baseWhere)
      .groupBy(documentsTable.issuer)
      .orderBy(desc(count())),
    db.select({ v: yearOf, n: count() }).from(documentsTable).where(baseWhere).groupBy(yearOf).orderBy(desc(yearOf)),
  ]);
  const total = Number(totalRow?.n ?? 0);
  const groupOrder = Object.keys(DOC_GROUP_LABEL);
  res.json(
    ListDocumentsResponse.parse({
      items: rows.map((r) => toDocument(r, lk)),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
      facets: {
        groups: groups
          .sort((a, b) => groupOrder.indexOf(a.v) - groupOrder.indexOf(b.v))
          .map((g) => ({ value: g.v, label: DOC_GROUP_LABEL[g.v] ?? g.v, count: Number(g.n) })),
        docTypes: types.map((t) => ({ value: t.v, label: t.v, count: Number(t.n) })),
        issuers: issuers.map((i) => ({ value: i.v, label: i.v, count: Number(i.n) })),
        years: years.map((y) => ({ value: y.v, label: `Năm ${y.v}`, count: Number(y.n) })),
      },
    }),
  );
});

router.get("/documents/:id", async (req, res) => {
  const { id } = parseInput(GetDocumentParams, req.params);
  const [row] = await db.select().from(documentsTable).where(eq(documentsTable.id, id)).limit(1);
  if (!row) throw notFound("Không tìm thấy văn bản");
  const [lk, related] = await Promise.all([
    loadLookups(),
    db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.docGroup, row.docGroup), ne(documentsTable.id, row.id)))
      .orderBy(desc(documentsTable.issuedDate))
      .limit(5),
  ]);
  res.json(GetDocumentResponse.parse({ document: toDocument(row, lk), related: related.map((r) => toDocument(r, lk)) }));
});

router.post("/documents/:id/download", async (req, res) => {
  const { id } = parseInput(RecordDocumentDownloadParams, req.params);
  const [row] = await db
    .update(documentsTable)
    .set({ downloadCount: sql`${documentsTable.downloadCount} + 1` })
    .where(eq(documentsTable.id, id))
    .returning({ fileUrl: documentsTable.fileUrl, downloadCount: documentsTable.downloadCount });
  if (!row) throw notFound("Không tìm thấy văn bản");
  res.json(RecordDocumentDownloadResponse.parse(row));
});

async function assertRefs(fieldId: number | null | undefined, projectId: number | null | undefined) {
  if (fieldId != null) {
    const rows = await db.select({ id: activityFieldsTable.id }).from(activityFieldsTable).where(eq(activityFieldsTable.id, fieldId)).limit(1);
    if (!rows.length) throw badRequest("Lĩnh vực không tồn tại");
  }
  if (projectId != null) {
    const rows = await db.select({ id: projectsTable.id }).from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
    if (!rows.length) throw badRequest("Đề tài, dự án không tồn tại");
  }
}

const textOrNull = (value: string | null | undefined, fallback: string | null) =>
  value === undefined ? fallback : value?.trim() || null;

router.post("/admin/documents", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateDocumentBody, req.body);
  await assertRefs(body.fieldId, body.projectId);
  const [row] = await db
    .insert(documentsTable)
    .values({
      number: body.number.trim(),
      title: body.title.trim(),
      docType: body.docType.trim(),
      docGroup: body.docGroup,
      issuer: body.issuer.trim(),
      signer: body.signer?.trim() || null,
      issuedDate: body.issuedDate,
      effectiveDate: body.effectiveDate || null,
      fieldId: body.fieldId ?? null,
      projectId: body.projectId ?? null,
      summary: body.summary?.trim() || null,
      fileUrl: body.fileUrl?.trim() || null,
      fileName: body.fileName?.trim() || null,
      fileSize: body.fileSize ?? null,
      fileFormat: body.fileFormat?.trim() || null,
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm văn bản",
    entityType: "document",
    entityId: row!.id,
    entityTitle: `${row!.number} – ${row!.title}`,
  });
  res.status(201).json(CreateDocumentResponse.parse(toDocument(row!, await loadLookups())));
});

router.patch("/admin/documents/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateDocumentParams, req.params);
  const body = parseInput(UpdateDocumentBody, req.body);
  const [current] = await db.select().from(documentsTable).where(eq(documentsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy văn bản");
  await assertRefs(body.fieldId, body.projectId);
  const [row] = await db
    .update(documentsTable)
    .set({
      number: body.number?.trim() ?? current.number,
      title: body.title?.trim() ?? current.title,
      docType: body.docType?.trim() ?? current.docType,
      docGroup: body.docGroup ?? current.docGroup,
      issuer: body.issuer?.trim() ?? current.issuer,
      signer: textOrNull(body.signer, current.signer),
      issuedDate: body.issuedDate ?? current.issuedDate,
      effectiveDate: body.effectiveDate === undefined ? current.effectiveDate : body.effectiveDate || null,
      fieldId: body.fieldId === undefined ? current.fieldId : body.fieldId,
      projectId: body.projectId === undefined ? current.projectId : body.projectId,
      summary: textOrNull(body.summary, current.summary),
      fileUrl: textOrNull(body.fileUrl, current.fileUrl),
      fileName: textOrNull(body.fileName, current.fileName),
      fileSize: body.fileSize === undefined ? current.fileSize : body.fileSize,
      fileFormat: textOrNull(body.fileFormat, current.fileFormat),
    })
    .where(eq(documentsTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật văn bản",
    entityType: "document",
    entityId: id,
    entityTitle: `${row!.number} – ${row!.title}`,
  });
  res.json(UpdateDocumentResponse.parse(toDocument(row!, await loadLookups())));
});

router.delete("/admin/documents/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteDocumentParams, req.params);
  const [current] = await db.select().from(documentsTable).where(eq(documentsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy văn bản");
  await db.delete(documentsTable).where(eq(documentsTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa văn bản",
    entityType: "document",
    entityId: id,
    entityTitle: `${current.number} – ${current.title}`,
  });
  res.status(204).end();
});

/* ------------------------------ Album ------------------------------ */

router.get("/albums", async (req, res) => {
  const query = parseInput(ListAlbumsQueryParams, req.query);
  const rows = await db
    .select()
    .from(albumsTable)
    .where(query.type ? eq(albumsTable.type, query.type) : undefined)
    .orderBy(sql`${albumsTable.eventDate} desc nulls last`, desc(albumsTable.id));
  res.json(ListAlbumsResponse.parse(rows.map(toAlbum)));
});

router.get("/albums/:slug", async (req, res) => {
  const { slug } = parseInput(GetAlbumParams, req.params);
  const [row] = await db.select().from(albumsTable).where(eq(albumsTable.slug, slug)).limit(1);
  if (!row) throw notFound("Không tìm thấy album");
  res.json(GetAlbumResponse.parse(toAlbum(row)));
});

async function albumSlug(input: string, excludeId?: number) {
  return uniqueSlug(slugify(input, "album"), async (slug) => {
    const rows = await db
      .select({ id: albumsTable.id })
      .from(albumsTable)
      .where(excludeId ? and(eq(albumsTable.slug, slug), ne(albumsTable.id, excludeId)) : eq(albumsTable.slug, slug))
      .limit(1);
    return rows.length > 0;
  });
}

router.post("/admin/albums", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateAlbumBody, req.body);
  const [row] = await db
    .insert(albumsTable)
    .values({
      slug: await albumSlug(body.slug?.trim() || body.title),
      title: body.title.trim(),
      type: body.type,
      description: body.description?.trim() || null,
      coverImage: body.coverImage?.trim() || null,
      eventDate: body.eventDate || null,
      items: body.items ?? [],
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Tạo album",
    entityType: "album",
    entityId: row!.id,
    entityTitle: row!.title,
    detail: `${row!.items.length} mục`,
  });
  res.status(201).json(CreateAlbumResponse.parse(toAlbum(row!)));
});

router.patch("/admin/albums/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateAlbumParams, req.params);
  const body = parseInput(UpdateAlbumBody, req.body);
  const [current] = await db.select().from(albumsTable).where(eq(albumsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy album");
  const slug =
    body.slug !== undefined && body.slug.trim() && body.slug.trim() !== current.slug
      ? await albumSlug(body.slug.trim(), id)
      : current.slug;
  const [row] = await db
    .update(albumsTable)
    .set({
      slug,
      title: body.title?.trim() ?? current.title,
      type: body.type ?? current.type,
      description: textOrNull(body.description, current.description),
      coverImage: textOrNull(body.coverImage, current.coverImage),
      eventDate: body.eventDate === undefined ? current.eventDate : body.eventDate || null,
      items: body.items ?? current.items,
    })
    .where(eq(albumsTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật album",
    entityType: "album",
    entityId: id,
    entityTitle: row!.title,
  });
  res.json(UpdateAlbumResponse.parse(toAlbum(row!)));
});

router.delete("/admin/albums/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteAlbumParams, req.params);
  const [current] = await db.select().from(albumsTable).where(eq(albumsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy album");
  await db.delete(albumsTable).where(eq(albumsTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa album",
    entityType: "album",
    entityId: id,
    entityTitle: current.title,
  });
  res.status(204).end();
});

/* -------------------------- Cơ cấu tổ chức -------------------------- */

router.get("/leaders", async (_req, res) => {
  const rows = await db.select().from(leadersTable).orderBy(asc(leadersTable.sortOrder), asc(leadersTable.id));
  res.json(ListLeadersResponse.parse(rows.map(toLeader)));
});

router.get("/org-units", async (_req, res) => {
  const rows = await db.select().from(orgUnitsTable).orderBy(asc(orgUnitsTable.sortOrder), asc(orgUnitsTable.id));
  res.json(ListOrgUnitsResponse.parse(rows.map(toOrgUnit)));
});

export default router;
