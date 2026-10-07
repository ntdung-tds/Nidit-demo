import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import { db, articlesTable, type ArticleRow } from "@workspace/db";
import {
  CreateArticleBody,
  CreateArticleResponse,
  DeleteArticleParams,
  GetAdminArticleParams,
  GetAdminArticleResponse,
  ListAdminArticlesQueryParams,
  ListAdminArticlesResponse,
  TransitionArticleBody,
  TransitionArticleParams,
  TransitionArticleResponse,
  UpdateArticleBody,
  UpdateArticleParams,
  UpdateArticleResponse,
  type ArticleStatus,
} from "@workspace/api-zod";
import { getActor, requireRole, type Role } from "../lib/auth";
import { badRequest, forbidden, notFound, paging, parseInput, totalPages } from "../lib/http";
import { logActivity } from "../lib/activity";
import { loadLookups, toAdminArticleSummary } from "../lib/serializers";
import { cleanHtml, stripHtml, truncate } from "../lib/text";
import { textSearch } from "../lib/search";
import { categoryWithDescendants } from "../lib/visibility";
import { addHistory, articleSlug, assertCategoryExists, buildAdminArticle, userNameMap } from "../lib/articles";
import { ACTIVITY_LABEL, canEditArticle, statusLabel, TRANSITIONS } from "../lib/workflow";

const router: IRouter = Router();

const SCHEDULE_THRESHOLD_MS = 30_000;

async function loadArticle(id: number): Promise<ArticleRow> {
  const [row] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!row) throw notFound("Không tìm thấy bài viết");
  return row;
}

const cleanList = (values: string[] | undefined) =>
  values === undefined ? undefined : [...new Set(values.map((v) => v.trim()).filter(Boolean))];

router.get("/admin/articles", async (req, res) => {
  const query = parseInput(ListAdminArticlesQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 20);
  const lk = await loadLookups();
  const base: (SQL | undefined)[] = [];
  if (query.categoryId) {
    base.push(inArray(articlesTable.categoryId, categoryWithDescendants(lk.categories.values(), query.categoryId)));
  }
  if (query.createdById) base.push(eq(articlesTable.createdById, query.createdById));
  if (query.origin) base.push(eq(articlesTable.origin, query.origin));
  base.push(textSearch(query.q, [articlesTable.title, articlesTable.summary, articlesTable.slug]));
  const where = and(...base, query.status ? eq(articlesTable.status, query.status) : undefined);
  const [rows, [totalRow], statusRows, users] = await Promise.all([
    db.select().from(articlesTable).where(where).orderBy(desc(articlesTable.updatedAt), desc(articlesTable.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(articlesTable).where(where),
    db
      .select({ status: articlesTable.status, n: count() })
      .from(articlesTable)
      .where(and(...base))
      .groupBy(articlesTable.status),
    userNameMap(),
  ]);
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListAdminArticlesResponse.parse({
      items: rows.map((r) => toAdminArticleSummary(r, lk, users)),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
      statusCounts: statusRows.map((s) => ({ status: s.status, count: Number(s.n) })),
    }),
  );
});

router.post("/admin/articles", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateArticleBody, req.body);
  await assertCategoryExists(body.categoryId);
  const content = cleanHtml(body.content);
  const [row] = await db
    .insert(articlesTable)
    .values({
      title: body.title.trim(),
      slug: await articleSlug(body.slug?.trim() || body.title),
      summary: body.summary?.trim() || truncate(stripHtml(content), 240),
      content,
      status: "draft",
      categoryId: body.categoryId ?? null,
      language: body.language ?? "vi",
      coverImage: body.coverImage?.trim() || null,
      coverCaption: body.coverCaption?.trim() || null,
      authorName: body.authorName?.trim() || null,
      keywords: cleanList(body.keywords) ?? [],
      tags: cleanList(body.tags) ?? [],
      sourceName: body.sourceName?.trim() || null,
      sourceUrl: body.sourceUrl?.trim() || null,
      isFeatured: body.isFeatured ?? false,
      eventStartAt: body.eventStartAt ?? null,
      eventLocation: body.eventLocation?.trim() || null,
      seoTitle: body.seoTitle?.trim() || null,
      seoDescription: body.seoDescription?.trim() || null,
      unpublishAt: body.unpublishAt ?? null,
      createdById: actor.id,
      origin: "manual",
    })
    .returning();
  await addHistory(row!.id, actor, { action: "create", fromStatus: null, toStatus: "draft" });
  await logActivity(actor, {
    action: "create",
    actionLabel: "Tạo bài viết",
    entityType: "article",
    entityId: row!.id,
    entityTitle: row!.title,
  });
  res.status(201).json(CreateArticleResponse.parse(await buildAdminArticle(row!, actor)));
});

router.get("/admin/articles/:id", async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(GetAdminArticleParams, req.params);
  res.json(GetAdminArticleResponse.parse(await buildAdminArticle(await loadArticle(id), actor)));
});

router.patch("/admin/articles/:id", async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateArticleParams, req.params);
  const body = parseInput(UpdateArticleBody, req.body);
  const current = await loadArticle(id);
  if (!canEditArticle(actor.role, current.status)) {
    throw forbidden(`Bài viết đang ở trạng thái "${statusLabel(current.status)}", vai trò của bạn không thể chỉnh sửa`);
  }
  if (body.categoryId !== undefined) await assertCategoryExists(body.categoryId);
  const unpublishAt = body.unpublishAt === undefined ? current.unpublishAt : body.unpublishAt;
  if (unpublishAt && current.publishedAt && unpublishAt <= current.publishedAt) {
    throw badRequest("Thời điểm gỡ bài phải sau thời điểm xuất bản");
  }
  const slug =
    body.slug !== undefined && body.slug.trim() && body.slug.trim() !== current.slug
      ? await articleSlug(body.slug.trim(), id)
      : current.slug;
  const content = body.content === undefined ? current.content : cleanHtml(body.content);
  const pick = <T>(value: T | undefined, fallback: T) => (value === undefined ? fallback : value);
  const textOrNull = (value: string | null | undefined, fallback: string | null) =>
    value === undefined ? fallback : value?.trim() || null;
  const [row] = await db
    .update(articlesTable)
    .set({
      title: body.title?.trim() || current.title,
      slug,
      summary: body.summary === undefined ? current.summary : body.summary.trim(),
      content,
      categoryId: pick(body.categoryId, current.categoryId),
      language: body.language ?? current.language,
      coverImage: textOrNull(body.coverImage, current.coverImage),
      coverCaption: textOrNull(body.coverCaption, current.coverCaption),
      authorName: textOrNull(body.authorName, current.authorName),
      keywords: cleanList(body.keywords) ?? current.keywords,
      tags: cleanList(body.tags) ?? current.tags,
      sourceName: textOrNull(body.sourceName, current.sourceName),
      sourceUrl: textOrNull(body.sourceUrl, current.sourceUrl),
      isFeatured: body.isFeatured ?? current.isFeatured,
      eventStartAt: pick(body.eventStartAt, current.eventStartAt),
      eventLocation: textOrNull(body.eventLocation, current.eventLocation),
      seoTitle: textOrNull(body.seoTitle, current.seoTitle),
      seoDescription: textOrNull(body.seoDescription, current.seoDescription),
      unpublishAt,
      updatedAt: new Date(),
    })
    .where(eq(articlesTable.id, id))
    .returning();
  await addHistory(id, actor, { action: "update", fromStatus: current.status, toStatus: current.status });
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật bài viết",
    entityType: "article",
    entityId: id,
    entityTitle: row!.title,
  });
  res.json(UpdateArticleResponse.parse(await buildAdminArticle(row!, actor)));
});

router.delete("/admin/articles/:id", async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteArticleParams, req.params);
  const current = await loadArticle(id);
  const ownDraft = actor.role === "editor" && current.createdById === actor.id && current.status === "draft";
  if (actor.role !== "admin" && !ownDraft) {
    throw forbidden("Chỉ quản trị viên, hoặc biên tập viên với bản nháp của chính mình, mới được xóa bài viết");
  }
  await db.delete(articlesTable).where(eq(articlesTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa bài viết",
    entityType: "article",
    entityId: id,
    entityTitle: current.title,
  });
  res.status(204).end();
});

router.post("/admin/articles/:id/transition", async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(TransitionArticleParams, req.params);
  const body = parseInput(TransitionArticleBody, req.body);
  const current = await loadArticle(id);
  const rule = TRANSITIONS[body.action];
  if (!rule.roles.includes(actor.role as Role)) {
    throw forbidden(`Vai trò của bạn không được thực hiện thao tác "${rule.label}"`);
  }
  if (!rule.from.includes(current.status as ArticleStatus)) {
    throw badRequest(`Không thể "${rule.label}" khi bài đang ở trạng thái "${statusLabel(current.status)}"`);
  }
  const now = new Date();
  const note = body.note?.trim() || null;
  const patch: Partial<typeof articlesTable.$inferInsert> = { updatedAt: now };
  let toStatus: ArticleStatus;
  let detail: string | null = note;

  switch (body.action) {
    case "submit":
      toStatus = "pending";
      break;
    case "request_changes":
      if (!note) throw badRequest("Vui lòng nhập nội dung yêu cầu chỉnh sửa");
      toStatus = "changes_requested";
      patch.reviewerNote = note;
      break;
    case "approve":
      toStatus = "approved";
      patch.reviewerNote = note;
      break;
    case "publish": {
      const publishAt = body.publishAt ?? now;
      const unpublishAt = body.unpublishAt === undefined ? current.unpublishAt : body.unpublishAt;
      if (unpublishAt && unpublishAt <= publishAt) throw badRequest("Thời điểm gỡ bài phải sau thời điểm xuất bản");
      if (unpublishAt && unpublishAt <= now) throw badRequest("Thời điểm gỡ bài phải ở tương lai");
      const scheduled = publishAt.getTime() - now.getTime() > SCHEDULE_THRESHOLD_MS;
      toStatus = scheduled ? "scheduled" : "published";
      patch.publishedAt = scheduled ? publishAt : now;
      patch.unpublishAt = unpublishAt;
      patch.reviewerNote = null;
      const fmt = (d: Date) => d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
      detail = [
        scheduled ? `Hẹn giờ xuất bản lúc ${fmt(publishAt)}` : null,
        unpublishAt ? `Tự động gỡ lúc ${fmt(unpublishAt)}` : null,
        note,
      ]
        .filter(Boolean)
        .join(" · ") || null;
      break;
    }
    case "unpublish":
      toStatus = "unpublished";
      patch.unpublishAt = null;
      break;
    case "revert_to_draft":
      toStatus = "draft";
      break;
  }
  patch.status = toStatus;
  const [row] = await db.update(articlesTable).set(patch).where(eq(articlesTable.id, id)).returning();
  await addHistory(id, actor, { action: body.action, fromStatus: current.status, toStatus, note: detail });
  await logActivity(actor, {
    action: body.action,
    actionLabel: toStatus === "scheduled" ? "Hẹn giờ xuất bản bài viết" : ACTIVITY_LABEL[body.action],
    entityType: "article",
    entityId: id,
    entityTitle: current.title,
    detail,
  });
  res.json(TransitionArticleResponse.parse(await buildAdminArticle(row!, actor)));
});

export default router;
