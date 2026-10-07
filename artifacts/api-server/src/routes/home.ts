import { Router, type IRouter } from "express";
import { and, asc, count, desc, eq, gte, inArray, isNotNull, lt, notInArray } from "drizzle-orm";
import {
  db,
  activityFieldsTable,
  albumsTable,
  articlesTable,
  datasetsTable,
  documentsTable,
  evaluationServicesTable,
  projectsTable,
  publicationsTable,
} from "@workspace/db";
import type { PgTable } from "drizzle-orm/pg-core";
import { GetHomeFeedQueryParams, GetHomeFeedResponse } from "@workspace/api-zod";
import { parseInput } from "../lib/http";
import { loadLookups, toAlbum, toArticleSummary, toDataset, toDocument, toProject } from "../lib/serializers";
import { categoryWithDescendants, publicArticleCondition } from "../lib/visibility";

const router: IRouter = Router();

async function countOf(table: PgTable): Promise<number> {
  const [row] = await db.select({ n: count() }).from(table);
  return Number(row?.n ?? 0);
}

router.get("/home", async (req, res) => {
  const { lang = "vi" } = parseInput(GetHomeFeedQueryParams, req.query);
  const lk = await loadLookups();
  const now = new Date();
  const visible = and(publicArticleCondition(now), eq(articlesTable.language, lang));

  const featuredRows = await db
    .select()
    .from(articlesTable)
    .where(and(visible, eq(articlesTable.isFeatured, true)))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(5);
  const featuredIds = featuredRows.map((r) => r.id);
  const latestRows = await db
    .select()
    .from(articlesTable)
    .where(featuredIds.length ? and(visible, notInArray(articlesTable.id, featuredIds)) : visible)
    .orderBy(desc(articlesTable.publishedAt))
    .limit(10);
  if (featuredRows.length < 3) {
    // Thiếu tin nổi bật thì lấy tin mới nhất bù vào
    featuredRows.push(...latestRows.splice(0, 3 - featuredRows.length));
  }
  const mostReadRows = await db
    .select()
    .from(articlesTable)
    .where(visible)
    .orderBy(desc(articlesTable.viewCount), desc(articlesTable.publishedAt))
    .limit(5);

  // Mỗi chuyên mục cấp 1 có bài viết được một khối trên trang chủ (tối đa 6)
  const topCategories = [...lk.categories.values()]
    .filter((c) => c.parentId == null && c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const sections = [];
  for (const category of topCategories) {
    if (sections.length >= 6) break;
    const ids = categoryWithDescendants(lk.categories.values(), category.id);
    const rows = await db
      .select()
      .from(articlesTable)
      .where(and(visible, inArray(articlesTable.categoryId, ids)))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(4);
    if (!rows.length) continue;
    sections.push({
      categoryId: category.id,
      categoryName: lang === "en" && category.nameEn ? category.nameEn : category.name,
      categorySlug: category.slug,
      articles: rows.map((r) => toArticleSummary(r, lk)),
    });
  }

  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const upcoming = await db
    .select()
    .from(articlesTable)
    .where(and(visible, isNotNull(articlesTable.eventStartAt), gte(articlesTable.eventStartAt, dayAgo)))
    .orderBy(asc(articlesTable.eventStartAt))
    .limit(4);
  if (upcoming.length < 4) {
    const past = await db
      .select()
      .from(articlesTable)
      .where(and(visible, isNotNull(articlesTable.eventStartAt), lt(articlesTable.eventStartAt, dayAgo)))
      .orderBy(desc(articlesTable.eventStartAt))
      .limit(4 - upcoming.length);
    upcoming.push(...past);
  }

  const [projects, publications, datasets, documents, services, fields] = await Promise.all([
    countOf(projectsTable),
    countOf(publicationsTable),
    countOf(datasetsTable),
    countOf(documentsTable),
    countOf(evaluationServicesTable),
    countOf(activityFieldsTable),
  ]);

  const [docRows, datasetRows, projectRows, albumRows] = await Promise.all([
    db.select().from(documentsTable).orderBy(desc(documentsTable.issuedDate), desc(documentsTable.id)).limit(5),
    db.select().from(datasetsTable).orderBy(desc(datasetsTable.downloadCount)).limit(4),
    db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.status, "ongoing"))
      .orderBy(desc(projectsTable.startYear), desc(projectsTable.updatedAt))
      .limit(3),
    db.select().from(albumsTable).orderBy(desc(albumsTable.eventDate), desc(albumsTable.id)).limit(4),
  ]);

  res.json(
    GetHomeFeedResponse.parse({
      featured: featuredRows.map((r) => toArticleSummary(r, lk)),
      latest: latestRows.slice(0, 8).map((r) => toArticleSummary(r, lk)),
      mostRead: mostReadRows.map((r) => toArticleSummary(r, lk)),
      sections,
      upcomingEvents: upcoming.map((r) => toArticleSummary(r, lk)),
      stats: { projects, publications, datasets, documents, services, fields },
      latestDocuments: docRows.map((r) => toDocument(r, lk)),
      featuredDatasets: datasetRows.map((r) => toDataset(r, lk)),
      featuredProjects: projectRows.map((r) => toProject(r, lk)),
      albums: albumRows.map(toAlbum),
    }),
  );
});

export default router;
