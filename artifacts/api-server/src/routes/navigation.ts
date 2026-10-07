import { Router, type IRouter } from "express";
import { and, asc, count, eq, inArray, ne } from "drizzle-orm";
import { db, articlesTable, categoriesTable, menuItemsTable, type CategoryRow } from "@workspace/db";
import {
  CreateCategoryBody,
  CreateCategoryResponse,
  CreateMenuItemBody,
  CreateMenuItemResponse,
  DeleteCategoryParams,
  DeleteMenuItemParams,
  ListCategoriesResponse,
  ListMenuItemsQueryParams,
  ListMenuItemsResponse,
  UpdateCategoryBody,
  UpdateCategoryParams,
  UpdateCategoryResponse,
  UpdateMenuItemBody,
  UpdateMenuItemParams,
  UpdateMenuItemResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { badRequest, notFound, parseInput } from "../lib/http";
import { logActivity } from "../lib/activity";
import { toCategory, toMenuItem } from "../lib/serializers";
import { slugify, uniqueSlug } from "../lib/text";
import { publicArticleCondition } from "../lib/visibility";

const router: IRouter = Router();

/* ------------------------------ Menu ------------------------------ */

router.get("/menu-items", async (req, res) => {
  const query = parseInput(ListMenuItemsQueryParams, req.query);
  const rows = await db
    .select()
    .from(menuItemsTable)
    .where(query.location ? eq(menuItemsTable.location, query.location) : undefined)
    .orderBy(asc(menuItemsTable.location), asc(menuItemsTable.sortOrder), asc(menuItemsTable.id));
  res.json(ListMenuItemsResponse.parse(rows.map(toMenuItem)));
});

async function assertMenuParent(parentId: number | null | undefined, location: string, selfId?: number) {
  if (parentId == null) return;
  if (selfId !== undefined && parentId === selfId) throw badRequest("Mục menu không thể là cha của chính nó");
  const all = await db.select().from(menuItemsTable);
  const parent = all.find((m) => m.id === parentId);
  if (!parent) throw badRequest("Mục menu cha không tồn tại");
  if (parent.location !== location) throw badRequest("Mục menu cha phải cùng vị trí hiển thị");
  if (selfId !== undefined) {
    // Không cho chọn cha là con/cháu của chính nó
    let cursor: number | null = parent.parentId;
    while (cursor != null) {
      if (cursor === selfId) throw badRequest("Không thể chọn mục con làm mục cha");
      cursor = all.find((m) => m.id === cursor)?.parentId ?? null;
    }
  }
}

router.post("/admin/menu-items", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateMenuItemBody, req.body);
  await assertMenuParent(body.parentId, body.location);
  const [row] = await db
    .insert(menuItemsTable)
    .values({
      label: body.label.trim(),
      labelEn: body.labelEn?.trim() || null,
      url: body.url.trim(),
      parentId: body.parentId ?? null,
      location: body.location,
      sortOrder: body.sortOrder ?? 0,
      isVisible: body.isVisible ?? true,
      openInNewTab: body.openInNewTab ?? false,
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm mục menu",
    entityType: "menu",
    entityId: row!.id,
    entityTitle: row!.label,
  });
  res.status(201).json(CreateMenuItemResponse.parse(toMenuItem(row!)));
});

router.patch("/admin/menu-items/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateMenuItemParams, req.params);
  const body = parseInput(UpdateMenuItemBody, req.body);
  const [current] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy mục menu");
  const location = body.location ?? current.location;
  const parentId = body.parentId === undefined ? current.parentId : body.parentId;
  await assertMenuParent(parentId, location, id);
  const [row] = await db
    .update(menuItemsTable)
    .set({
      label: body.label?.trim() ?? current.label,
      labelEn: body.labelEn === undefined ? current.labelEn : body.labelEn?.trim() || null,
      url: body.url?.trim() ?? current.url,
      parentId,
      location,
      sortOrder: body.sortOrder ?? current.sortOrder,
      isVisible: body.isVisible ?? current.isVisible,
      openInNewTab: body.openInNewTab ?? current.openInNewTab,
    })
    .where(eq(menuItemsTable.id, id))
    .returning();
  if (body.location && body.location !== current.location) {
    // Mục con đi theo vị trí mới của mục cha
    await db.update(menuItemsTable).set({ location }).where(eq(menuItemsTable.parentId, id));
  }
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật mục menu",
    entityType: "menu",
    entityId: id,
    entityTitle: row!.label,
  });
  res.json(UpdateMenuItemResponse.parse(toMenuItem(row!)));
});

router.delete("/admin/menu-items/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteMenuItemParams, req.params);
  const all = await db.select().from(menuItemsTable);
  const target = all.find((m) => m.id === id);
  if (!target) throw notFound("Không tìm thấy mục menu");
  const ids = [id];
  for (let i = 0; i < ids.length; i += 1) {
    for (const child of all) if (child.parentId === ids[i]) ids.push(child.id);
  }
  await db.delete(menuItemsTable).where(inArray(menuItemsTable.id, ids));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa mục menu",
    entityType: "menu",
    entityId: id,
    entityTitle: target.label,
    detail: ids.length > 1 ? `Xóa kèm ${ids.length - 1} mục con` : null,
  });
  res.status(204).end();
});

/* --------------------------- Chuyên mục --------------------------- */

async function categoryCounts(): Promise<Map<number, number>> {
  const rows = await db
    .select({ categoryId: articlesTable.categoryId, n: count() })
    .from(articlesTable)
    .where(publicArticleCondition())
    .groupBy(articlesTable.categoryId);
  return new Map(rows.filter((r) => r.categoryId != null).map((r) => [r.categoryId as number, Number(r.n)]));
}

router.get("/categories", async (_req, res) => {
  const [rows, counts] = await Promise.all([
    db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.id)),
    categoryCounts(),
  ]);
  res.json(ListCategoriesResponse.parse(rows.map((c) => toCategory(c, counts.get(c.id) ?? 0))));
});

async function categorySlug(input: string, excludeId?: number) {
  return uniqueSlug(slugify(input, "chuyen-muc"), async (slug) => {
    const rows = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(excludeId ? and(eq(categoriesTable.slug, slug), ne(categoriesTable.id, excludeId)) : eq(categoriesTable.slug, slug))
      .limit(1);
    return rows.length > 0;
  });
}

function assertCategoryParent(all: CategoryRow[], parentId: number | null | undefined, selfId?: number) {
  if (parentId == null) return;
  if (parentId === selfId) throw badRequest("Chuyên mục không thể là cha của chính nó");
  let cursor: CategoryRow | undefined = all.find((c) => c.id === parentId);
  if (!cursor) throw badRequest("Chuyên mục cha không tồn tại");
  while (cursor) {
    if (cursor.id === selfId) throw badRequest("Không thể chọn chuyên mục con làm chuyên mục cha");
    const parentOfCursor: number | null = cursor.parentId;
    cursor = parentOfCursor == null ? undefined : all.find((c) => c.id === parentOfCursor);
  }
}

router.post("/admin/categories", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(CreateCategoryBody, req.body);
  const all = await db.select().from(categoriesTable);
  assertCategoryParent(all, body.parentId);
  const [row] = await db
    .insert(categoriesTable)
    .values({
      name: body.name.trim(),
      nameEn: body.nameEn?.trim() || null,
      slug: await categorySlug(body.slug?.trim() || body.name),
      parentId: body.parentId ?? null,
      description: body.description?.trim() || null,
      sortOrder: body.sortOrder ?? 0,
      isVisible: body.isVisible ?? true,
    })
    .returning();
  await logActivity(actor, {
    action: "create",
    actionLabel: "Thêm chuyên mục",
    entityType: "category",
    entityId: row!.id,
    entityTitle: row!.name,
  });
  res.status(201).json(CreateCategoryResponse.parse(toCategory(row!, 0)));
});

router.patch("/admin/categories/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateCategoryParams, req.params);
  const body = parseInput(UpdateCategoryBody, req.body);
  const all = await db.select().from(categoriesTable);
  const current = all.find((c) => c.id === id);
  if (!current) throw notFound("Không tìm thấy chuyên mục");
  const parentId = body.parentId === undefined ? current.parentId : body.parentId;
  assertCategoryParent(all, parentId, id);
  const slug =
    body.slug !== undefined && body.slug.trim() && body.slug.trim() !== current.slug
      ? await categorySlug(body.slug.trim(), id)
      : current.slug;
  const [row] = await db
    .update(categoriesTable)
    .set({
      name: body.name?.trim() ?? current.name,
      nameEn: body.nameEn === undefined ? current.nameEn : body.nameEn?.trim() || null,
      slug,
      parentId,
      description: body.description === undefined ? current.description : body.description?.trim() || null,
      sortOrder: body.sortOrder ?? current.sortOrder,
      isVisible: body.isVisible ?? current.isVisible,
    })
    .where(eq(categoriesTable.id, id))
    .returning();
  const counts = await categoryCounts();
  await logActivity(actor, {
    action: "update",
    actionLabel: "Cập nhật chuyên mục",
    entityType: "category",
    entityId: id,
    entityTitle: row!.name,
  });
  res.json(UpdateCategoryResponse.parse(toCategory(row!, counts.get(id) ?? 0)));
});

router.delete("/admin/categories/:id", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(DeleteCategoryParams, req.params);
  const all = await db.select().from(categoriesTable);
  const current = all.find((c) => c.id === id);
  if (!current) throw notFound("Không tìm thấy chuyên mục");
  if (all.some((c) => c.parentId === id)) {
    throw badRequest("Chuyên mục còn chuyên mục con. Hãy xóa hoặc chuyển các chuyên mục con trước.");
  }
  const [usage] = await db.select({ n: count() }).from(articlesTable).where(eq(articlesTable.categoryId, id));
  const n = Number(usage?.n ?? 0);
  if (n > 0) {
    throw badRequest(`Chuyên mục đang có ${n} bài viết. Hãy chuyển các bài sang chuyên mục khác trước khi xóa.`);
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  await logActivity(actor, {
    action: "delete",
    actionLabel: "Xóa chuyên mục",
    entityType: "category",
    entityId: id,
    entityTitle: current.name,
  });
  res.status(204).end();
});

export default router;
