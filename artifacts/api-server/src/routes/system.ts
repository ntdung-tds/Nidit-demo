import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, gte, inArray, isNotNull, ne, sql } from "drizzle-orm";
import {
  db,
  activityLogsTable,
  albumsTable,
  articlesTable,
  backupsTable,
  crawlItemsTable,
  crawlSourcesTable,
  datasetsTable,
  documentsTable,
  inquiriesTable,
  mediaTable,
  projectsTable,
  publicationsTable,
  usersTable,
  visitsTable,
} from "@workspace/db";
import {
  CreateBackupBody,
  CreateBackupResponse,
  CreateMediaBody,
  CreateMediaResponse,
  CreateUserBody,
  CreateUserResponse,
  DeleteMediaParams,
  GetDashboardResponse,
  GetVisitStatsQueryParams,
  GetVisitStatsResponse,
  ListActivityLogsQueryParams,
  ListActivityLogsResponse,
  ListBackupsResponse,
  ListMediaQueryParams,
  ListMediaResponse,
  ListUsersResponse,
  UpdateUserBody,
  UpdateUserParams,
  UpdateUserResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, notFound, paging, parseInput, totalPages } from "../lib/http";
import { logActivity } from "../lib/activity";
import { loadLookups, toActivityLog, toAdminArticleSummary, toBackup, toMedia, toUser } from "../lib/serializers";
import { userNameMap } from "../lib/articles";
import { textSearch } from "../lib/search";
import { publicArticleCondition } from "../lib/visibility";
import { dailyVisits, vnDayStart } from "../lib/stats";
import { serializeSources } from "./crawler";
import { serializeInquiries } from "./inquiries";

const router: IRouter = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLE_LABEL: Record<string, string> = { admin: "Quản trị", editor: "Biên tập", reviewer: "Duyệt bài" };

const countOf = async (query: Promise<{ n: number }[]>) => Number((await query)[0]?.n ?? 0);

/* ------------------------------ Bảng điều khiển ------------------------------ */

router.get("/admin/dashboard", async (req, res) => {
  const actor = getActor(req);
  const [
    articles,
    published,
    pending,
    scheduled,
    documents,
    datasets,
    projects,
    publications,
    albums,
    inquiriesNew,
    crawlPending,
    users,
    statusRows,
    visits,
    pendingRows,
    myRows,
    scheduledRows,
    activityRows,
    topRows,
    sourceRows,
    inquiryRows,
    lk,
    names,
  ] = await Promise.all([
    countOf(db.select({ n: count() }).from(articlesTable)),
    countOf(db.select({ n: count() }).from(articlesTable).where(publicArticleCondition())),
    countOf(db.select({ n: count() }).from(articlesTable).where(eq(articlesTable.status, "pending"))),
    countOf(db.select({ n: count() }).from(articlesTable).where(eq(articlesTable.status, "scheduled"))),
    countOf(db.select({ n: count() }).from(documentsTable)),
    countOf(db.select({ n: count() }).from(datasetsTable)),
    countOf(db.select({ n: count() }).from(projectsTable)),
    countOf(db.select({ n: count() }).from(publicationsTable)),
    countOf(db.select({ n: count() }).from(albumsTable)),
    countOf(db.select({ n: count() }).from(inquiriesTable).where(eq(inquiriesTable.status, "new"))),
    countOf(db.select({ n: count() }).from(crawlItemsTable).where(eq(crawlItemsTable.status, "pending"))),
    countOf(db.select({ n: count() }).from(usersTable).where(eq(usersTable.isActive, true))),
    db.select({ status: articlesTable.status, n: count() }).from(articlesTable).groupBy(articlesTable.status),
    dailyVisits(14),
    db.select().from(articlesTable).where(eq(articlesTable.status, "pending")).orderBy(asc(articlesTable.updatedAt)).limit(6),
    db
      .select()
      .from(articlesTable)
      .where(and(eq(articlesTable.createdById, actor.id), inArray(articlesTable.status, ["draft", "changes_requested"])))
      .orderBy(desc(articlesTable.updatedAt))
      .limit(6),
    db.select().from(articlesTable).where(eq(articlesTable.status, "scheduled")).orderBy(asc(articlesTable.publishedAt)).limit(6),
    db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt), desc(activityLogsTable.id)).limit(8),
    db
      .select({ id: articlesTable.id, title: articlesTable.title, slug: articlesTable.slug, views: articlesTable.viewCount })
      .from(articlesTable)
      .where(publicArticleCondition())
      .orderBy(desc(articlesTable.viewCount))
      .limit(5),
    db.select().from(crawlSourcesTable).orderBy(asc(crawlSourcesTable.id)),
    db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt)).limit(5),
    loadLookups(),
    userNameMap(),
  ]);
  const summary = (rows: (typeof articlesTable.$inferSelect)[]) => rows.map((r) => toAdminArticleSummary(r, lk, names));
  res.json(
    GetDashboardResponse.parse({
      totals: {
        articles,
        published,
        pending,
        scheduled,
        documents,
        datasets,
        projects,
        publications,
        albums,
        inquiriesNew,
        crawlPending,
        users,
      },
      statusCounts: statusRows.map((s) => ({ status: s.status, count: Number(s.n) })),
      visits,
      pendingReview: summary(pendingRows),
      myWork: summary(myRows),
      scheduled: summary(scheduledRows),
      recentActivity: activityRows.map(toActivityLog),
      topArticles: topRows.map((r) => ({ ...r, views: Number(r.views) })),
      crawlSources: await serializeSources(sourceRows),
      recentInquiries: await serializeInquiries(inquiryRows),
    }),
  );
});

/* -------------------------------- Thống kê truy cập -------------------------------- */

router.get("/admin/stats/visits", async (req, res) => {
  const query = parseInput(GetVisitStatsQueryParams, req.query);
  const days = query.days ?? 30;
  const since = vnDayStart(days - 1);
  const inRange = gte(visitsTable.createdAt, since);
  const [daily, [totals], topPages, topArticles, devices, referrers, sections] = await Promise.all([
    dailyVisits(days),
    db
      .select({ views: count(), visitors: sql<number>`count(distinct ${visitsTable.visitorHash})` })
      .from(visitsTable)
      .where(inRange),
    db
      .select({ path: visitsTable.path, views: count() })
      .from(visitsTable)
      .where(inRange)
      .groupBy(visitsTable.path)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({ id: articlesTable.id, title: articlesTable.title, slug: articlesTable.slug, views: count() })
      .from(visitsTable)
      .innerJoin(articlesTable, eq(visitsTable.articleId, articlesTable.id))
      .where(and(inRange, isNotNull(visitsTable.articleId)))
      .groupBy(articlesTable.id, articlesTable.title, articlesTable.slug)
      .orderBy(desc(count()))
      .limit(10),
    db.select({ label: visitsTable.device, count: count() }).from(visitsTable).where(inRange).groupBy(visitsTable.device).orderBy(desc(count())),
    db
      .select({ label: sql<string>`coalesce(${visitsTable.referrerHost}, 'Truy cập trực tiếp')`, count: count() })
      .from(visitsTable)
      .where(inRange)
      .groupBy(sql`coalesce(${visitsTable.referrerHost}, 'Truy cập trực tiếp')`)
      .orderBy(desc(count()))
      .limit(8),
    db.select({ label: visitsTable.section, count: count() }).from(visitsTable).where(inRange).groupBy(visitsTable.section).orderBy(desc(count())),
  ]);
  const totalViews = Number(totals?.views ?? 0);
  const num = <T extends { count: number }>(rows: T[]) => rows.map((r) => ({ ...r, count: Number(r.count) }));
  res.json(
    GetVisitStatsResponse.parse({
      days,
      totalViews,
      totalVisitors: Number(totals?.visitors ?? 0),
      avgViewsPerDay: Math.round(totalViews / days),
      daily,
      topPages: topPages.map((p) => ({ path: p.path, views: Number(p.views) })),
      topArticles: topArticles.map((a) => ({ ...a, views: Number(a.views) })),
      devices: num(devices),
      referrers: num(referrers),
      sections: num(sections),
    }),
  );
});

/* -------------------------------- Nhật ký hệ thống -------------------------------- */

router.get("/admin/activity-logs", requireRole("admin"), async (req, res) => {
  const query = parseInput(ListActivityLogsQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 30);
  const where = and(
    query.actorId ? eq(activityLogsTable.actorId, query.actorId) : undefined,
    query.entityType ? eq(activityLogsTable.entityType, query.entityType) : undefined,
  );
  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(activityLogsTable)
      .where(where)
      .orderBy(desc(activityLogsTable.createdAt), desc(activityLogsTable.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(activityLogsTable).where(where),
  ]);
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListActivityLogsResponse.parse({ items: rows.map(toActivityLog), total, page, pageSize, totalPages: totalPages(total, pageSize) }),
  );
});

/* ---------------------------------- Người dùng ---------------------------------- */

router.get("/admin/users", requireRole("admin"), async (_req, res) => {
  const rows = await db
    .select()
    .from(usersTable)
    .orderBy(sql`case ${usersTable.role} when 'admin' then 0 when 'editor' then 1 else 2 end`, asc(usersTable.id));
  res.json(ListUsersResponse.parse(rows.map(toUser)));
});

async function assertEmailFree(email: string, excludeId?: number) {
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.email, email), excludeId ? ne(usersTable.id, excludeId) : undefined))
    .limit(1);
  if (existing) throw badRequest("Email này đã được dùng cho tài khoản khác");
}

router.post("/admin/users", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateUserBody, req.body);
  const email = body.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw badRequest("Địa chỉ email không hợp lệ");
  await assertEmailFree(email);
  const [row] = await db
    .insert(usersTable)
    .values({
      fullName: body.fullName.trim(),
      email,
      role: body.role,
      title: body.title?.trim() ?? "",
      unit: body.unit?.trim() ?? "",
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Tạo tài khoản",
    entityType: "user",
    entityId: row!.id,
    entityTitle: row!.fullName,
    detail: `Vai trò: ${ROLE_LABEL[row!.role] ?? row!.role}`,
  });
  res.status(201).json(CreateUserResponse.parse(toUser(row!)));
});

router.patch("/admin/users/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateUserParams, req.params);
  const body = parseInput(UpdateUserBody, req.body);
  const [current] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy tài khoản");
  const role = body.role ?? current.role;
  const isActive = body.isActive ?? current.isActive;
  if (id === actor.id && (role !== "admin" || !isActive)) {
    throw badRequest("Không thể tự khóa hoặc tự hạ quyền tài khoản đang đăng nhập");
  }
  if (current.role === "admin" && current.isActive && (role !== "admin" || !isActive)) {
    const otherAdmins = await countOf(
      db
        .select({ n: count() })
        .from(usersTable)
        .where(and(eq(usersTable.role, "admin"), eq(usersTable.isActive, true), ne(usersTable.id, id))),
    );
    if (otherAdmins === 0) throw badRequest("Hệ thống phải còn ít nhất một tài khoản quản trị đang hoạt động");
  }
  let email = current.email;
  if (body.email !== undefined) {
    email = body.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw badRequest("Địa chỉ email không hợp lệ");
    await assertEmailFree(email, id);
  }
  const [row] = await db
    .update(usersTable)
    .set({
      fullName: body.fullName?.trim() ?? current.fullName,
      email,
      role,
      title: body.title?.trim() ?? current.title,
      unit: body.unit?.trim() ?? current.unit,
      isActive,
    })
    .where(eq(usersTable.id, id))
    .returning();
  const changes: string[] = [];
  if (role !== current.role) changes.push(`vai trò ${ROLE_LABEL[current.role] ?? current.role} → ${ROLE_LABEL[role] ?? role}`);
  if (isActive !== current.isActive) changes.push(isActive ? "mở khóa" : "khóa tài khoản");
  await logActivity(actor, {
    action: isActive !== current.isActive ? (isActive ? "unlock" : "lock") : "update",
    actionLabel: isActive !== current.isActive ? (isActive ? "Mở khóa tài khoản" : "Khóa tài khoản") : "Cập nhật tài khoản",
    entityType: "user",
    entityId: id,
    entityTitle: row!.fullName,
    detail: changes.length ? changes.join("; ") : null,
  });
  res.json(UpdateUserResponse.parse(toUser(row!)));
});

/* ---------------------------------- Sao lưu ---------------------------------- */

const BACKUP_TABLES = [
  "site_settings",
  "users",
  "menu_items",
  "categories",
  "static_pages",
  "articles",
  "article_history",
  "activity_fields",
  "projects",
  "publications",
  "datasets",
  "evaluation_services",
  "documents",
  "albums",
  "leaders",
  "org_units",
  "inquiries",
  "crawl_sources",
  "crawl_items",
  "media",
];
const MAX_BACKUPS = 20;

const backupColumns = {
  id: backupsTable.id,
  note: backupsTable.note,
  createdById: backupsTable.createdById,
  createdByName: backupsTable.createdByName,
  sizeBytes: backupsTable.sizeBytes,
  tables: backupsTable.tables,
  createdAt: backupsTable.createdAt,
};

router.get("/admin/backups", requireRole("admin"), async (_req, res) => {
  const rows = await db.select(backupColumns).from(backupsTable).orderBy(desc(backupsTable.createdAt), desc(backupsTable.id));
  res.json(ListBackupsResponse.parse(rows.map(toBackup)));
});

router.post("/admin/backups", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateBackupBody, req.body ?? {});
  const data: Record<string, unknown[]> = {};
  const tables: { table: string; rows: number }[] = [];
  for (const table of BACKUP_TABLES) {
    const result = await db.execute(sql`select * from ${sql.identifier(table)} order by 1`);
    data[table] = result.rows;
    tables.push({ table, rows: result.rows.length });
  }
  const sizeBytes = Buffer.byteLength(JSON.stringify(data), "utf8");
  const [row] = await db
    .insert(backupsTable)
    .values({
      note: body.note?.trim() || null,
      createdById: actor.id,
      createdByName: actor.fullName,
      sizeBytes,
      tables,
      data,
    })
    .returning(backupColumns);
  // Giữ tối đa MAX_BACKUPS bản gần nhất
  const old = await db.select({ id: backupsTable.id }).from(backupsTable).orderBy(desc(backupsTable.createdAt), desc(backupsTable.id)).offset(MAX_BACKUPS);
  if (old.length) await db.delete(backupsTable).where(inArray(backupsTable.id, old.map((o) => o.id)));
  await logActivity(actor, {
    action: "backup",
    actionLabel: "Tạo bản sao lưu dữ liệu",
    entityType: "backup",
    entityId: row!.id,
    entityTitle: row!.note ?? `Bản sao lưu #${row!.id}`,
    detail: `${tables.reduce((s, t) => s + t.rows, 0)} bản ghi, ${(sizeBytes / 1024).toFixed(0)} KB`,
  });
  res.status(201).json(CreateBackupResponse.parse(toBackup(row!)));
});

/* ---------------------------------- Thư viện tư liệu ---------------------------------- */

function inferMediaType(url: string): "image" | "video" | "file" {
  const path = url.split("?")[0]!.toLowerCase();
  if (/\.(jpe?g|png|webp|gif|svg|avif)$/.test(path)) return "image";
  if (/\.(mp4|webm|mov|m3u8)$/.test(path) || /youtube\.com|youtu\.be|vimeo\.com/.test(path)) return "video";
  return "file";
}

router.get("/admin/media", requireRole("admin", "editor"), async (req, res) => {
  const query = parseInput(ListMediaQueryParams, req.query);
  const rows = await db
    .select()
    .from(mediaTable)
    .where(and(query.type ? eq(mediaTable.type, query.type) : undefined, textSearch(query.q, [mediaTable.title, mediaTable.alt, mediaTable.url])))
    .orderBy(desc(mediaTable.createdAt), desc(mediaTable.id))
    .limit(300);
  res.json(ListMediaResponse.parse(rows.map(toMedia)));
});

router.post("/admin/media", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateMediaBody, req.body);
  const url = body.url.trim();
  if (!/^https?:\/\/\S+$/i.test(url) && !/^\/\S*$/.test(url)) {
    throw badRequest("Đường dẫn tư liệu phải bắt đầu bằng http://, https:// hoặc /");
  }
  const [row] = await db
    .insert(mediaTable)
    .values({ url, title: body.title.trim(), alt: body.alt?.trim() || null, type: body.type ?? inferMediaType(url) })
    .returning();
  await logActivity(actor, { action: "create", actionLabel: "Thêm tư liệu", entityType: "media", entityId: row!.id, entityTitle: row!.title });
  res.status(201).json(CreateMediaResponse.parse(toMedia(row!)));
});

router.delete("/admin/media/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteMediaParams, req.params);
  const [row] = await db.delete(mediaTable).where(eq(mediaTable.id, id)).returning();
  if (!row) throw notFound("Không tìm thấy tư liệu");
  await logActivity(actor, { action: "delete", actionLabel: "Xóa tư liệu", entityType: "media", entityId: id, entityTitle: row.title });
  res.status(204).end();
});

export default router;
