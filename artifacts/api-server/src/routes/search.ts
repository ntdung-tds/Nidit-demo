import { Router, type IRouter } from "express";
import { and, count, desc, eq, sql, type AnyColumn, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import {
  db,
  articlesTable,
  datasetsTable,
  documentsTable,
  evaluationServicesTable,
  projectsTable,
  publicationsTable,
  staticPagesTable,
} from "@workspace/db";
import { SearchSiteQueryParams, SearchSiteResponse, type SearchHit, type SearchType } from "@workspace/api-zod";
import { parseInput } from "../lib/http";
import { truncate } from "../lib/text";
import { arrayText, textSearch } from "../lib/search";
import { publicArticleCondition } from "../lib/visibility";

const router: IRouter = Router();

const GROUP_LABEL: Record<SearchType, string> = {
  article: "Tin tức",
  document: "Văn bản",
  project: "Đề tài, dự án",
  publication: "Công bố khoa học",
  dataset: "Dữ liệu AI",
  service: "Đánh giá, kiểm định",
  page: "Trang thông tin",
};

const htmlText = (column: AnyColumn) => sql`regexp_replace(${column}, '<[^>]+>', ' ', 'g')`;

export function pageUrl(slug: string): string {
  if (slug === "gioi-thieu") return "/gioi-thieu";
  if (slug === "chuc-nang-nhiem-vu") return "/gioi-thieu/chuc-nang-nhiem-vu";
  return `/trang/${slug}`;
}

const isoDate = (d: Date | null) => (d ? d.toISOString() : null);

interface Searcher {
  table: PgTable;
  where: (q: string) => SQL | undefined;
  hits: (q: string, limit: number) => Promise<SearchHit[]>;
}

const SEARCHERS: Record<SearchType, Searcher> = {
  article: {
    table: articlesTable,
    where: (q) =>
      and(
        publicArticleCondition(),
        textSearch(q, [
          articlesTable.title,
          articlesTable.summary,
          arrayText(articlesTable.keywords),
          arrayText(articlesTable.tags),
          htmlText(articlesTable.content),
        ]),
      ),
    hits: async (q, limit) => {
      const rows = await db
        .select()
        .from(articlesTable)
        .where(SEARCHERS.article.where(q))
        .orderBy(desc(articlesTable.publishedAt))
        .limit(limit);
      return rows.map((r) => ({
        type: "article",
        id: r.id,
        title: r.title,
        snippet: truncate(r.summary, 220) || null,
        url: `/tin-tuc/${r.slug}`,
        date: isoDate(r.publishedAt),
      }));
    },
  },
  document: {
    table: documentsTable,
    where: (q) =>
      textSearch(q, [documentsTable.number, documentsTable.title, documentsTable.summary, documentsTable.issuer]),
    hits: async (q, limit) => {
      const rows = await db
        .select()
        .from(documentsTable)
        .where(SEARCHERS.document.where(q))
        .orderBy(desc(documentsTable.issuedDate))
        .limit(limit);
      return rows.map((r) => ({
        type: "document",
        id: r.id,
        title: `${r.docType} số ${r.number}: ${r.title}`,
        snippet: [r.issuer, r.summary].filter(Boolean).join(" · ") || null,
        url: `/van-ban/${r.id}`,
        date: r.issuedDate,
      }));
    },
  },
  project: {
    table: projectsTable,
    where: (q) =>
      textSearch(q, [
        projectsTable.title,
        projectsTable.code,
        projectsTable.summary,
        projectsTable.leadName,
        arrayText(projectsTable.keywords),
      ]),
    hits: async (q, limit) => {
      const rows = await db
        .select()
        .from(projectsTable)
        .where(SEARCHERS.project.where(q))
        .orderBy(desc(projectsTable.startYear))
        .limit(limit);
      return rows.map((r) => ({
        type: "project",
        id: r.id,
        title: r.title,
        snippet: `${r.code} · ${r.leadName} · ${r.startYear}–${r.endYear ?? "nay"}. ${truncate(r.summary, 160)}`,
        url: `/nghien-cuu/${r.slug}`,
        date: null,
      }));
    },
  },
  publication: {
    table: publicationsTable,
    where: (q) =>
      textSearch(q, [
        publicationsTable.title,
        publicationsTable.authors,
        publicationsTable.venue,
        arrayText(publicationsTable.keywords),
      ]),
    hits: async (q, limit) => {
      const rows = await db
        .select()
        .from(publicationsTable)
        .where(SEARCHERS.publication.where(q))
        .orderBy(desc(publicationsTable.year))
        .limit(limit);
      return rows.map((r) => ({
        type: "publication",
        id: r.id,
        title: r.title,
        snippet: `${r.authors} · ${r.venue}, ${r.year}`,
        url: `/cong-bo-khoa-hoc?q=${encodeURIComponent(r.title)}`,
        date: null,
      }));
    },
  },
  dataset: {
    table: datasetsTable,
    where: (q) =>
      textSearch(q, [
        datasetsTable.title,
        datasetsTable.summary,
        arrayText(datasetsTable.keywords),
        arrayText(datasetsTable.aiTasks),
      ]),
    hits: async (q, limit) => {
      const rows = await db
        .select()
        .from(datasetsTable)
        .where(SEARCHERS.dataset.where(q))
        .orderBy(desc(datasetsTable.downloadCount))
        .limit(limit);
      return rows.map((r) => ({
        type: "dataset",
        id: r.id,
        title: r.title,
        snippet: truncate(r.summary, 220),
        url: `/du-lieu-ai/${r.slug}`,
        date: r.issuedDate,
      }));
    },
  },
  service: {
    table: evaluationServicesTable,
    where: (q) => textSearch(q, [evaluationServicesTable.name, evaluationServicesTable.summary]),
    hits: async (q, limit) => {
      const rows = await db
        .select()
        .from(evaluationServicesTable)
        .where(SEARCHERS.service.where(q))
        .orderBy(evaluationServicesTable.sortOrder)
        .limit(limit);
      return rows.map((r) => ({
        type: "service",
        id: r.id,
        title: r.name,
        snippet: truncate(r.summary, 220),
        url: `/danh-gia-kiem-dinh/${r.slug}`,
        date: null,
      }));
    },
  },
  page: {
    table: staticPagesTable,
    where: (q) =>
      and(
        eq(staticPagesTable.status, "published"),
        textSearch(q, [staticPagesTable.title, staticPagesTable.summary, htmlText(staticPagesTable.content)]),
      ),
    hits: async (q, limit) => {
      const rows = await db.select().from(staticPagesTable).where(SEARCHERS.page.where(q)).limit(limit);
      return rows.map((r) => ({
        type: "page",
        id: r.id,
        title: r.title,
        snippet: r.summary ? truncate(r.summary, 220) : null,
        url: pageUrl(r.slug),
        date: null,
      }));
    },
  },
};

router.get("/search", async (req, res) => {
  const { q, type } = parseInput(SearchSiteQueryParams, req.query);
  const term = q.trim().slice(0, 100);
  const types = Object.keys(SEARCHERS) as SearchType[];
  const groups = await Promise.all(
    types.map(async (t) => {
      const searcher = SEARCHERS[t];
      const [row] = await db.select({ n: count() }).from(searcher.table).where(searcher.where(term));
      const total = Number(row?.n ?? 0);
      const wanted = !type || type === t;
      const items = total && wanted ? await searcher.hits(term, type ? 30 : 5) : [];
      return { type: t, label: GROUP_LABEL[t], total, items };
    }),
  );
  const nonEmpty = groups.filter((g) => g.total > 0);
  res.json(
    SearchSiteResponse.parse({
      query: term,
      total: nonEmpty.reduce((sum, g) => sum + g.total, 0),
      groups: nonEmpty,
    }),
  );
});

export default router;
