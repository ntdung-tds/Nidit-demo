import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, ne, notInArray, sql, type SQL } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import {
  GetArticleParams,
  GetArticleResponse,
  ListArticlesQueryParams,
  ListArticlesResponse,
  ListPopularArticlesQueryParams,
  ListPopularArticlesResponse,
} from "@workspace/api-zod";
import { notFound, paging, parseInput, totalPages } from "../lib/http";
import { loadLookups, toArticle, toArticleSummary } from "../lib/serializers";
import { arrayText, textSearch } from "../lib/search";
import { categoryWithDescendants, publicArticleCondition } from "../lib/visibility";

const router: IRouter = Router();

router.get("/articles", async (req, res) => {
  const query = parseInput(ListArticlesQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 12);
  const lk = await loadLookups();
  const conditions: (SQL | undefined)[] = [publicArticleCondition(), eq(articlesTable.language, query.lang ?? "vi")];
  if (query.category) {
    const category = [...lk.categories.values()].find((c) => c.slug === query.category);
    if (!category) {
      res.json(ListArticlesResponse.parse({ items: [], total: 0, page, pageSize, totalPages: 1 }));
      return;
    }
    conditions.push(inArray(articlesTable.categoryId, categoryWithDescendants(lk.categories.values(), category.id)));
  }
  if (query.tag?.trim()) conditions.push(sql`${query.tag.trim()} = any(${articlesTable.tags})`);
  conditions.push(
    textSearch(query.q, [articlesTable.title, articlesTable.summary, arrayText(articlesTable.keywords), arrayText(articlesTable.tags)]),
  );
  const where = and(...conditions);
  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(articlesTable)
      .where(where)
      .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(articlesTable).where(where),
  ]);
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListArticlesResponse.parse({
      items: rows.map((r) => toArticleSummary(r, lk)),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
    }),
  );
});

router.get("/articles/popular", async (req, res) => {
  const query = parseInput(ListPopularArticlesQueryParams, req.query);
  const lk = await loadLookups();
  const rows = await db
    .select()
    .from(articlesTable)
    .where(and(publicArticleCondition(), eq(articlesTable.language, query.lang ?? "vi")))
    .orderBy(desc(articlesTable.viewCount), desc(articlesTable.publishedAt))
    .limit(query.limit ?? 6);
  res.json(ListPopularArticlesResponse.parse(rows.map((r) => toArticleSummary(r, lk))));
});

router.get("/articles/:slug", async (req, res) => {
  const { slug } = parseInput(GetArticleParams, req.params);
  const [row] = await db
    .select()
    .from(articlesTable)
    .where(and(eq(articlesTable.slug, slug), publicArticleCondition()))
    .limit(1);
  if (!row) throw notFound("Không tìm thấy tin bài hoặc tin bài đã được gỡ");
  const lk = await loadLookups();
  const base = and(publicArticleCondition(), eq(articlesTable.language, row.language), ne(articlesTable.id, row.id));
  const related = row.categoryId
    ? await db
        .select()
        .from(articlesTable)
        .where(and(base, eq(articlesTable.categoryId, row.categoryId)))
        .orderBy(desc(articlesTable.publishedAt))
        .limit(4)
    : [];
  if (related.length < 4) {
    const exclude = related.map((r) => r.id);
    const more = await db
      .select()
      .from(articlesTable)
      .where(exclude.length ? and(base, notInArray(articlesTable.id, exclude)) : base)
      .orderBy(desc(articlesTable.publishedAt))
      .limit(4 - related.length);
    related.push(...more);
  }
  res.json(
    GetArticleResponse.parse({
      article: toArticle(row, lk),
      related: related.map((r) => toArticleSummary(r, lk)),
    }),
  );
});

export default router;
