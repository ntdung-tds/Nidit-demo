import { Router, type IRouter } from "express";
import { and, asc, eq, ne } from "drizzle-orm";
import { db, staticPagesTable, usersTable, type StaticPageRow } from "@workspace/db";
import {
  CreateStaticPageBody,
  CreateStaticPageResponse,
  DeleteStaticPageParams,
  GetAdminPageParams,
  GetAdminPageResponse,
  GetStaticPageParams,
  GetStaticPageResponse,
  ListAdminPagesResponse,
  UpdateStaticPageBody,
  UpdateStaticPageParams,
  UpdateStaticPageResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, notFound, parseInput } from "../lib/http";
import { logActivity } from "../lib/activity";
import { toStaticPage } from "../lib/serializers";
import { cleanHtml, slugify, uniqueSlug } from "../lib/text";

const router: IRouter = Router();

/** Trang tĩnh mà giao diện công khai đang liên kết tới, không cho xóa */
const SYSTEM_PAGES = new Set([
  "gioi-thieu",
  "chuc-nang-nhiem-vu",
  "chinh-sach-bao-mat",
  "dieu-khoan-su-dung",
  "huong-dan-khai-thac-du-lieu",
]);

async function userNames(): Promise<Map<number, string>> {
  const rows = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  return new Map(rows.map((u) => [u.id, u.fullName]));
}

function serialize(row: StaticPageRow, names: Map<number, string>) {
  return toStaticPage(row, row.updatedById ? (names.get(row.updatedById) ?? null) : null);
}

async function pageSlug(input: string, excludeId?: number) {
  return uniqueSlug(slugify(input, "trang"), async (slug) => {
    const rows = await db
      .select({ id: staticPagesTable.id })
      .from(staticPagesTable)
      .where(excludeId ? and(eq(staticPagesTable.slug, slug), ne(staticPagesTable.id, excludeId)) : eq(staticPagesTable.slug, slug))
      .limit(1);
    return rows.length > 0;
  });
}

router.get("/pages/:slug", async (req, res) => {
  const { slug } = parseInput(GetStaticPageParams, req.params);
  const [row] = await db
    .select()
    .from(staticPagesTable)
    .where(and(eq(staticPagesTable.slug, slug), eq(staticPagesTable.status, "published")))
    .limit(1);
  if (!row) throw notFound("Không tìm thấy trang");
  res.json(GetStaticPageResponse.parse(serialize(row, await userNames())));
});

router.get("/admin/pages", requireRole("admin", "editor", "reviewer"), async (_req, res) => {
  const [rows, names] = await Promise.all([
    db.select().from(staticPagesTable).orderBy(asc(staticPagesTable.id)),
    userNames(),
  ]);
  res.json(ListAdminPagesResponse.parse(rows.map((r) => serialize(r, names))));
});

router.post("/admin/pages", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateStaticPageBody, req.body);
  const [row] = await db
    .insert(staticPagesTable)
    .values({
      title: body.title.trim(),
      slug: await pageSlug(body.slug?.trim() || body.title),
      titleEn: body.titleEn?.trim() || null,
      summary: body.summary?.trim() || null,
      content: cleanHtml(body.content),
      contentEn: body.contentEn ? cleanHtml(body.contentEn) : null,
      status: body.status ?? "draft",
      seoTitle: body.seoTitle?.trim() || null,
      seoDescription: body.seoDescription?.trim() || null,
      updatedById: actor.id,
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Tạo trang tĩnh",
    entityType: "page",
    entityId: row!.id,
    entityTitle: row!.title,
  });
  res.status(201).json(CreateStaticPageResponse.parse(serialize(row!, await userNames())));
});

router.get("/admin/pages/:id", requireRole("admin", "editor", "reviewer"), async (req, res) => {
  const { id } = parseInput(GetAdminPageParams, req.params);
  const [row] = await db.select().from(staticPagesTable).where(eq(staticPagesTable.id, id)).limit(1);
  if (!row) throw notFound("Không tìm thấy trang");
  res.json(GetAdminPageResponse.parse(serialize(row, await userNames())));
});

router.patch("/admin/pages/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateStaticPageParams, req.params);
  const body = parseInput(UpdateStaticPageBody, req.body);
  const [current] = await db.select().from(staticPagesTable).where(eq(staticPagesTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy trang");
  let slug = current.slug;
  if (body.slug !== undefined && body.slug.trim() && body.slug.trim() !== current.slug) {
    if (SYSTEM_PAGES.has(current.slug)) throw badRequest("Không thể đổi đường dẫn của trang hệ thống");
    slug = await pageSlug(body.slug.trim(), id);
  }
  const [row] = await db
    .update(staticPagesTable)
    .set({
      title: body.title?.trim() ?? current.title,
      slug,
      titleEn: body.titleEn === undefined ? current.titleEn : body.titleEn?.trim() || null,
      summary: body.summary === undefined ? current.summary : body.summary?.trim() || null,
      content: body.content === undefined ? current.content : cleanHtml(body.content),
      contentEn: body.contentEn === undefined ? current.contentEn : body.contentEn ? cleanHtml(body.contentEn) : null,
      status: body.status ?? current.status,
      seoTitle: body.seoTitle === undefined ? current.seoTitle : body.seoTitle?.trim() || null,
      seoDescription:
        body.seoDescription === undefined ? current.seoDescription : body.seoDescription?.trim() || null,
      updatedAt: new Date(),
      updatedById: actor.id,
    })
    .where(eq(staticPagesTable.id, id))
    .returning();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật trang tĩnh",
    entityType: "page",
    entityId: id,
    entityTitle: row!.title,
  });
  res.json(UpdateStaticPageResponse.parse(serialize(row!, await userNames())));
});

router.delete("/admin/pages/:id", requireRole("admin", "editor"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteStaticPageParams, req.params);
  const [current] = await db.select().from(staticPagesTable).where(eq(staticPagesTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy trang");
  if (SYSTEM_PAGES.has(current.slug)) {
    throw badRequest("Đây là trang hệ thống đang được liên kết trên trang công khai, không thể xóa");
  }
  await db.delete(staticPagesTable).where(eq(staticPagesTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa trang tĩnh",
    entityType: "page",
    entityId: id,
    entityTitle: current.title,
  });
  res.status(204).end();
});

export default router;
