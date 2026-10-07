import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const publicRoot = path.join(appRoot, "public");
const snapshotPath = path.join(appRoot, "src", "pages-snapshot.json");
const apiBase = (process.env.NIDIT_API_BASE ?? "http://localhost:80/api").replace(/\/+$/, "");
const pagesOrigin = (process.env.PAGES_ORIGIN ?? "https://ntdung-tds.github.io").replace(/\/+$/, "");
const pagesBasePath = `/${(process.env.PAGES_REPO_PATH ?? "Nidit-demo").replace(/^\/+|\/+$/g, "")}/`;

async function get(route) {
  const response = await fetch(`${apiBase}/${route}`);
  if (!response.ok) {
    throw new Error(`GET ${route} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function details(items, key, route) {
  const pairs = await Promise.all(items.map(async (item) => {
    const id = String(item[key]);
    return [id, await get(`${route}/${encodeURIComponent(id)}`)];
  }));
  return Object.fromEntries(pairs);
}

async function tryStaticPage(slug) {
  try {
    return [slug, await get(`pages/${encodeURIComponent(slug)}`)];
  } catch (error) {
    if (String(error).includes("404")) return null;
    throw error;
  }
}

function xmlEscape(value = "") {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  })[character]);
}

function makeRss(items, title, feedUrl) {
  const siteUrl = `${pagesOrigin}${pagesBasePath}`;
  const entries = items.slice(0, 30).map((article) => {
    const url = `${siteUrl}#/tin-tuc/${encodeURIComponent(article.slug)}`;
    const date = article.publishedAt ? new Date(article.publishedAt).toUTCString() : "";
    const cover = article.coverImage
      ? `<enclosure url="${xmlEscape(article.coverImage.startsWith("http") ? article.coverImage : `${siteUrl}${article.coverImage.replace(/^\/+/, "")}`)}" type="image/jpeg" length="0" />`
      : "";
    return [
      "<item>",
      `<title>${xmlEscape(article.title)}</title>`,
      `<link>${xmlEscape(url)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      `<description>${xmlEscape(article.summary)}</description>`,
      article.categoryName ? `<category>${xmlEscape(article.categoryName)}</category>` : "",
      date ? `<pubDate>${date}</pubDate>` : "",
      cover,
      "</item>",
    ].filter(Boolean).join("");
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>RSS tĩnh cho bản demo NIDIT.</description>
    <language>vi-VN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />
    ${entries}
  </channel>
</rss>
`;
}

async function main() {
  const [siteSettings, visitCounter, categories, fields, projects, publications, datasets, datasetStats, services, documents, albums, leaders, orgUnits] = await Promise.all([
    get("site-settings"),
    get("visit-counter"),
    get("categories"),
    get("fields"),
    get("projects?page=1&pageSize=100"),
    get("publications?page=1&pageSize=100"),
    get("datasets"),
    get("datasets/stats"),
    get("evaluation-services"),
    get("documents?page=1&pageSize=100"),
    get("albums"),
    get("leaders"),
    get("org-units"),
  ]);

  const [mainMenu, footerMenu, linksMenu, homeVi, homeEn, articlesVi, articlesEn, popularVi, popularEn] = await Promise.all([
    get("menu-items?location=main"),
    get("menu-items?location=footer"),
    get("menu-items?location=links"),
    get("home?lang=vi"),
    get("home?lang=en"),
    get("articles?page=1&pageSize=100&lang=vi"),
    get("articles?page=1&pageSize=100&lang=en"),
    get("articles/popular?lang=vi&limit=20"),
    get("articles/popular?lang=en&limit=20"),
  ]);

  const menus = [...mainMenu, ...footerMenu, ...linksMenu];
  const articleItems = [...new Map([...articlesVi.items, ...articlesEn.items].map((item) => [item.slug, item])).values()];
  const staticPageSlugs = new Set(["gioi-thieu", "chuc-nang-nhiem-vu"]);
  for (const item of menus) {
    const match = /^\/trang\/([^/?#]+)/.exec(item.url ?? "");
    if (match) staticPageSlugs.add(decodeURIComponent(match[1]));
  }

  const [articleDetails, fieldDetails, projectDetails, datasetDetails, serviceDetails, documentDetails, albumDetails, ...staticPagePairs] = await Promise.all([
    details(articleItems, "slug", "articles"),
    details(fields, "slug", "fields"),
    details(projects.items, "slug", "projects"),
    details(datasets, "slug", "datasets"),
    details(services, "slug", "evaluation-services"),
    details(documents.items, "id", "documents"),
    details(albums, "slug", "albums"),
    ...[...staticPageSlugs].map(tryStaticPage),
  ]);

  const staticPages = Object.fromEntries(staticPagePairs.filter(Boolean));
  const snapshot = {
    capturedAt: new Date().toISOString(),
    siteSettings: {
      ...siteSettings,
      demoNotice: "Bản demo tĩnh: nội dung được đóng gói tại thời điểm xuất bản. CMS, bộ đếm trực tiếp và biểu mẫu gửi dữ liệu đã tắt.",
    },
    visitCounter,
    menus,
    categories,
    home: { vi: homeVi, en: homeEn },
    articles: {
      vi: articlesVi,
      en: articlesEn,
      popular: { vi: popularVi, en: popularEn },
      details: articleDetails,
    },
    fields: { items: fields, details: fieldDetails },
    projects: { ...projects, details: projectDetails },
    publications,
    datasets: { items: datasets, stats: datasetStats, details: datasetDetails },
    services: { items: services, details: serviceDetails },
    documents: { ...documents, details: documentDetails },
    albums: { items: albums, details: albumDetails },
    leaders,
    orgUnits,
    staticPages,
  };

  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  const siteUrl = `${pagesOrigin}${pagesBasePath}`;
  const allFeedPath = path.join(publicRoot, "rss.xml");
  await writeFile(allFeedPath, makeRss(articlesVi.items, siteSettings.siteName, `${siteUrl}rss.xml`));
  for (const category of categories.filter((item) => item.isVisible)) {
    const page = await get(`articles?page=1&pageSize=100&lang=vi&category=${encodeURIComponent(category.slug)}`);
    const file = path.join(publicRoot, `rss-${category.slug}.xml`);
    await writeFile(file, makeRss(page.items, category.name, `${siteUrl}rss-${category.slug}.xml`));
  }

  console.info(`Exported static snapshot: ${articleItems.length} article details, ${documents.items.length} documents, ${staticPageSlugs.size} static pages.`);
  console.info(`Snapshot file: ${snapshotPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
