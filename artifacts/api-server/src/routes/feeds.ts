import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  activityFieldsTable,
  albumsTable,
  articlesTable,
  backupsTable,
  categoriesTable,
  datasetsTable,
  documentsTable,
  evaluationServicesTable,
  projectsTable,
  staticPagesTable,
  type DatasetColumnJson,
  type DatasetRow,
} from "@workspace/db";
import { requireAuthFromQuery, requireRole } from "../lib/auth";
import { badRequest, forbidden, notFound } from "../lib/http";
import { logActivity } from "../lib/activity";
import { publicArticleCondition, categoryWithDescendants } from "../lib/visibility";
import { xmlEscape } from "../lib/text";
import { loadSettings } from "./site";
import { pageUrl } from "./search";

const router: IRouter = Router();

function siteOrigin(req: Request): string {
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  return `${req.protocol}://${forwardedHost || req.get("host") || "localhost"}`;
}

/* ----------------------------------- RSS ----------------------------------- */

async function rssHandler(req: Request, res: Response) {
  const lang = req.query["lang"] === "en" ? "en" : "vi";
  const categorySlug = typeof req.query["category"] === "string" ? req.query["category"].trim() : "";
  const [settings, categories] = await Promise.all([loadSettings(), db.select().from(categoriesTable)]);
  let category: (typeof categories)[number] | undefined;
  if (categorySlug) {
    category = categories.find((c) => c.slug === categorySlug && c.isVisible);
    if (!category) throw notFound("Không tìm thấy chuyên mục");
  }
  const rows = await db
    .select()
    .from(articlesTable)
    .where(
      and(
        publicArticleCondition(),
        eq(articlesTable.language, lang),
        category ? inArray(articlesTable.categoryId, categoryWithDescendants(categories, category.id)) : undefined,
      ),
    )
    .orderBy(desc(articlesTable.publishedAt))
    .limit(30);
  const origin = siteOrigin(req);
  const catNames = new Map(categories.map((c) => [c.id, lang === "en" && c.nameEn ? c.nameEn : c.name]));
  const siteName = lang === "en" && settings.siteNameEn ? settings.siteNameEn : settings.siteName;
  const title = category ? `${catNames.get(category.id)} – ${siteName}` : siteName;
  const selfUrl = `${origin}/api/rss${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
  const items = rows
    .map((a) => {
      const link = `${origin}/tin-tuc/${a.slug}`;
      const cover = a.coverImage ? (a.coverImage.startsWith("http") ? a.coverImage : `${origin}${a.coverImage}`) : null;
      return [
        "    <item>",
        `      <title>${xmlEscape(a.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `      <description>${xmlEscape(a.summary)}</description>`,
        a.categoryId && catNames.get(a.categoryId) ? `      <category>${xmlEscape(catNames.get(a.categoryId)!)}</category>` : "",
        a.publishedAt ? `      <pubDate>${a.publishedAt.toUTCString()}</pubDate>` : "",
        cover ? `      <enclosure url="${xmlEscape(cover)}" type="image/jpeg" length="0" />` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xmlEscape(title)}</title>`,
    `    <link>${xmlEscape(origin)}/</link>`,
    `    <description>${xmlEscape(settings.seoDescription || siteName)}</description>`,
    `    <language>${lang === "en" ? "en" : "vi-VN"}</language>`,
    `    <copyright>${xmlEscape(settings.copyrightNote || siteName)}</copyright>`,
    `    <lastBuildDate>${(rows[0]?.publishedAt ?? new Date()).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.type("application/rss+xml; charset=utf-8").send(xml);
}

router.get("/rss", rssHandler);
router.get("/rss.xml", rssHandler);

/* --------------------------------- Sitemap --------------------------------- */

router.get("/sitemap.xml", async (req, res) => {
  const origin = siteOrigin(req);
  const [articles, pages, categories, fields, projects, datasets, services, albums, documents] = await Promise.all([
    db
      .select({ slug: articlesTable.slug, updatedAt: articlesTable.updatedAt })
      .from(articlesTable)
      .where(publicArticleCondition())
      .orderBy(desc(articlesTable.publishedAt))
      .limit(1000),
    db
      .select({ slug: staticPagesTable.slug, updatedAt: staticPagesTable.updatedAt })
      .from(staticPagesTable)
      .where(eq(staticPagesTable.status, "published")),
    db.select({ slug: categoriesTable.slug }).from(categoriesTable).where(eq(categoriesTable.isVisible, true)),
    db.select({ slug: activityFieldsTable.slug }).from(activityFieldsTable),
    db.select({ slug: projectsTable.slug, updatedAt: projectsTable.updatedAt }).from(projectsTable),
    db.select({ slug: datasetsTable.slug, updatedAt: datasetsTable.updatedAt }).from(datasetsTable),
    db.select({ slug: evaluationServicesTable.slug }).from(evaluationServicesTable),
    db.select({ slug: albumsTable.slug }).from(albumsTable),
    db.select({ id: documentsTable.id }).from(documentsTable),
  ]);
  const entries: { loc: string; lastmod?: Date; priority: string }[] = [
    { loc: "/", priority: "1.0" },
    ...[
      "/tin-tuc",
      "/gioi-thieu/chuc-nang-nhiem-vu",
      "/gioi-thieu/co-cau-to-chuc",
      "/gioi-thieu/lanh-dao",
      "/linh-vuc",
      "/nghien-cuu",
      "/cong-bo-khoa-hoc",
      "/du-lieu-ai",
      "/danh-gia-kiem-dinh",
      "/van-ban",
      "/thu-vien",
      "/lien-he",
      "/so-do-trang",
      "/rss",
    ].map((loc) => ({ loc, priority: "0.8" })),
    ...categories.map((c) => ({ loc: `/tin-tuc/chuyen-muc/${c.slug}`, priority: "0.7" })),
    ...pages.map((p) => ({ loc: pageUrl(p.slug), lastmod: p.updatedAt, priority: "0.6" })),
    ...fields.map((f) => ({ loc: `/linh-vuc/${f.slug}`, priority: "0.6" })),
    ...projects.map((p) => ({ loc: `/nghien-cuu/${p.slug}`, lastmod: p.updatedAt, priority: "0.5" })),
    ...datasets.map((d) => ({ loc: `/du-lieu-ai/${d.slug}`, lastmod: d.updatedAt, priority: "0.5" })),
    ...services.map((s) => ({ loc: `/danh-gia-kiem-dinh/${s.slug}`, priority: "0.5" })),
    ...albums.map((a) => ({ loc: `/thu-vien/${a.slug}`, priority: "0.4" })),
    ...documents.map((d) => ({ loc: `/van-ban/${d.id}`, priority: "0.4" })),
    ...articles.map((a) => ({ loc: `/tin-tuc/${a.slug}`, lastmod: a.updatedAt, priority: "0.6" })),
  ];
  const seen = new Set<string>();
  const body = entries
    .filter((e) => (seen.has(e.loc) ? false : (seen.add(e.loc), true)))
    .map(
      (e) =>
        `  <url><loc>${xmlEscape(origin + e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : ""}<priority>${e.priority}</priority></url>`,
    )
    .join("\n");
  res.setHeader("Cache-Control", "public, max-age=900");
  res
    .type("application/xml; charset=utf-8")
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`);
});

/* ------------------------------ Tải bản sao lưu ------------------------------ */

router.get("/admin/backups/:id/download", requireAuthFromQuery, requireRole("admin"), async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id) || id <= 0) throw badRequest("Mã bản sao lưu không hợp lệ");
  const [row] = await db.select().from(backupsTable).where(eq(backupsTable.id, id)).limit(1);
  if (!row) throw notFound("Không tìm thấy bản sao lưu");
  await logActivity(req.actor!, {
    action: "download",
    actionLabel: "Tải bản sao lưu",
    entityType: "backup",
    entityId: row.id,
    entityTitle: row.note ?? `Bản sao lưu #${row.id}`,
  });
  const stamp = row.createdAt.toISOString().slice(0, 16).replace(/[-:T]/g, "");
  res.setHeader("Content-Disposition", `attachment; filename="nidit-backup-${row.id}-${stamp}.json"`);
  res.setHeader("Cache-Control", "no-store");
  res.type("application/json; charset=utf-8").send(
    JSON.stringify({ format: "nidit-portal-backup", version: 1, createdAt: row.createdAt, note: row.note, tables: row.tables, data: row.data }, null, 2),
  );
});

/* ------------------------- Dữ liệu mẫu của bộ dữ liệu mở ------------------------- */

const SAMPLE_ROWS = 25;
const SENTENCES = [
  "Chuyển đổi số là nhiệm vụ trọng tâm của các cơ quan nhà nước.",
  "Hệ thống dịch vụ công trực tuyến giúp người dân tiết kiệm thời gian.",
  "Dữ liệu mở thúc đẩy nghiên cứu và đổi mới sáng tạo.",
  "Trí tuệ nhân tạo hỗ trợ phân tích văn bản hành chính hiệu quả hơn.",
  "Cần tăng cường bảo đảm an toàn thông tin cho hệ thống.",
  "Nền tảng số dùng chung góp phần giảm chi phí đầu tư.",
  "Doanh nghiệp nhỏ và vừa cần được hỗ trợ chuyển đổi số.",
  "Kết quả đánh giá cho thấy mức độ sẵn sàng còn chưa đồng đều.",
];
const LABELS = ["tích cực", "trung tính", "tiêu cực"];
const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế", "Nghệ An", "Khánh Hòa", "Lâm Đồng", "Quảng Ninh"];

function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

const PROVINCE_CODES = ["01", "79", "48", "31", "92", "46", "40", "56", "68", "22"];
const DOC_TYPES = ["Quyết định", "Thông báo", "Công văn", "Kế hoạch", "Báo cáo", "Tờ trình"];
const FIELD_NAMES = ["Chuyển đổi số", "Dữ liệu số", "Trí tuệ nhân tạo", "An toàn thông tin", "Dịch vụ công", "Công nghệ số"];
const QUESTIONS = [
  "Thủ tục cấp đổi giấy phép lái xe trực tuyến thực hiện như thế nào?",
  "Thời hạn giải quyết hồ sơ đăng ký thành lập doanh nghiệp là bao lâu?",
  "Cần chuẩn bị giấy tờ gì khi đăng ký khai sinh?",
  "Làm thế nào để tra cứu tình trạng hồ sơ dịch vụ công?",
  "Lệ phí cấp phiếu lý lịch tư pháp trực tuyến là bao nhiêu?",
];
const REGIONS = ["Bắc", "Trung", "Nam"];
const GENDERS = ["Nam", "Nữ"];
const DIAGNOSES = ["Bình thường", "Viêm phổi", "Tràn dịch màng phổi", "Nốt mờ phổi", "Bóng tim to"];
const INCIDENTS = ["Mã độc", "Tấn công từ chối dịch vụ", "Lừa đảo trực tuyến", "Truy cập trái phép", "Rò rỉ dữ liệu"];
const SEVERITY = ["Thấp", "Trung bình", "Cao", "Nghiêm trọng"];

/** Sinh giá trị mẫu theo tên và kiểu cột (tỉnh và mã tỉnh lấy theo số thứ tự dòng để khớp nhau) */
function sampleValue(col: DatasetColumnJson, i: number, rand: () => number): string | number | boolean {
  const name = col.name.toLowerCase();
  const type = col.type.toLowerCase();
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;
  const seq = String(i + 1).padStart(5, "0");
  if (/^ma_tinh$|province_code/.test(name)) return PROVINCE_CODES[i % PROVINCE_CODES.length]!;
  if (/^tinh$|province|dia_phuong/.test(name)) return PROVINCES[i % PROVINCES.length]!;
  if (/^id$|_id$|^ma_|^ma$|code/.test(name)) return `${name.replace(/_?id$/, "").toUpperCase() || "ID"}-${seq}`;
  if (/^tep_am_thanh|audio/.test(name)) return `audio/mau_${seq}.wav`;
  if (/^tep_anh|image/.test(name)) return `images/mau_${seq}.jpg`;
  if (/^nam$|^nam_|_nam$|year/.test(name)) return 2019 + Math.floor(rand() * 7);
  if (/vung_mien|region/.test(name)) return pick(REGIONS);
  if (/gioi_tinh|gender/.test(name)) return pick(GENDERS);
  if (/chan_doan|diagnos/.test(name)) return pick(DIAGNOSES);
  if (/loai_su_co|incident/.test(name)) return pick(INCIDENTS);
  if (/muc_do|severity/.test(name)) return pick(SEVERITY);
  if (/loai_van_ban/.test(name)) return pick(DOC_TYPES);
  if (/linh_vuc/.test(name)) return pick(FIELD_NAMES);
  if (/cau_hoi|question/.test(name)) return pick(QUESTIONS);
  if (/^so_tu$|word/.test(name)) return 60 + Math.floor(rand() * 740);
  if (/^so_vung$/.test(name)) return 1 + Math.floor(rand() * 14);
  if (/thoi_luong|duration/.test(name)) return Math.round((2 + rand() * 13) * 100) / 100;
  if (/^chi_so|index|score/.test(name)) return Math.round((0.35 + rand() * 0.6) * 1000) / 1000;
  if (/bool/.test(type)) return rand() > 0.5;
  if (/date|time|ngay|thoi_gian/.test(type) || /date|ngay|thoi_gian|time/.test(name)) {
    const d = new Date(Date.UTC(2024, 0, 1) + Math.floor(rand() * 600) * 86_400_000 + Math.floor(rand() * 86_400) * 1000);
    return d.toISOString().slice(0, /time|thoi_gian/.test(type) ? 19 : 10);
  }
  if (/float|double|decimal|real|so_thuc/.test(type)) return Math.round(rand() * 10000) / 100;
  if (/int|number|so|count/.test(type)) return Math.floor(rand() * 1000);
  if (/label|nhan|sentiment|cam_xuc/.test(name)) return pick(LABELS);
  return pick(SENTENCES);
}

function sampleRows(row: DatasetRow): Record<string, string | number | boolean>[] {
  const columns = row.columns.length
    ? row.columns
    : [
        { name: "id", type: "string", description: "Mã bản ghi" },
        { name: "noi_dung", type: "string", description: "Nội dung" },
        { name: "nhan", type: "string", description: "Nhãn" },
      ];
  const rand = seeded(row.id * 7919 + 17);
  return Array.from({ length: SAMPLE_ROWS }, (_, i) => Object.fromEntries(columns.map((c) => [c.name, sampleValue(c, i, rand)])));
}

const csvCell = (v: string | number | boolean) => {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

router.get("/open-data/:slug/:file", async (req, res) => {
  const slug = String(req.params["slug"]);
  const file = String(req.params["file"]);
  if (file !== "sample.csv" && file !== "sample.json") throw notFound("Không tìm thấy tệp dữ liệu");
  const [row] = await db.select().from(datasetsTable).where(eq(datasetsTable.slug, slug)).limit(1);
  if (!row) throw notFound("Không tìm thấy bộ dữ liệu");
  if (row.accessLevel === "restricted") throw forbidden("Bộ dữ liệu này cần được Viện phê duyệt trước khi khai thác");
  const rows = sampleRows(row);
  res.setHeader("Cache-Control", "public, max-age=3600");
  if (file === "sample.json") {
    res.json({
      dataset: row.title,
      version: row.version,
      license: row.license,
      note: "Dữ liệu mẫu minh họa cấu trúc bộ dữ liệu (bản demo). Bộ dữ liệu đầy đủ được cung cấp theo điều kiện khai thác.",
      columns: row.columns,
      total: rows.length,
      items: rows,
    });
    return;
  }
  const headers = Object.keys(rows[0] ?? {});
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => csvCell(r[h] ?? "")).join(","))].join("\r\n");
  res.setHeader("Content-Disposition", `attachment; filename="${row.slug}-mau.csv"`);
  res.type("text/csv; charset=utf-8").send(`\uFEFF${csv}\r\n`);
});

export default router;
