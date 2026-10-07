import type { visitsTable } from "@workspace/db";
import { sectionOf } from "../routes/site";
import { at, prng } from "./helpers";

type VisitInsert = typeof visitsTable.$inferInsert;

export interface VisitArticle {
  id: number;
  slug: string;
  publishedAt: Date;
  /** Mức độ quan tâm tương đối (lấy theo lượt xem dự kiến của bài) */
  weight: number;
}

export interface VisitCatalog {
  categories: string[];
  fields: string[];
  projects: string[];
  datasets: string[];
  services: string[];
  documents: number[];
  albums: string[];
}

const DAYS = 90;
const HOUR_WEIGHTS = [1, 0.6, 0.4, 0.4, 0.5, 1, 2, 4, 8, 10, 10, 8, 5, 6, 9, 9, 8, 5, 3, 4, 5, 5, 3, 2];
const DEVICES = [
  ["Máy tính", 52],
  ["Điện thoại", 43],
  ["Máy tính bảng", 5],
] as const;
const REFERRERS = [
  [null, 44],
  ["google.com", 30],
  ["facebook.com", 9],
  ["mst.gov.vn", 6],
  ["zalo.me", 4],
  ["coccoc.com", 3],
  ["bing.com", 2],
  ["chinhphu.vn", 2],
] as const;

type PathKind =
  | "home" | "article" | "news" | "category" | "about" | "leaders" | "org" | "mandate" | "fields" | "field" | "projects"
  | "project" | "publications" | "datasets" | "dataset" | "services" | "service" | "documents" | "document" | "library"
  | "album" | "contact" | "search";

const PATH_WEIGHTS: (readonly [PathKind, number])[] = [
  ["home", 30], ["article", 28], ["news", 6], ["category", 3], ["about", 4], ["leaders", 2], ["org", 2], ["mandate", 1],
  ["fields", 2], ["field", 2], ["projects", 2], ["project", 2], ["publications", 2], ["datasets", 4], ["dataset", 3],
  ["services", 2], ["service", 1], ["documents", 3], ["document", 1], ["library", 2], ["album", 1], ["contact", 2], ["search", 1],
];

/**
 * Sinh lượt truy cập mẫu cho 90 ngày gần nhất (200–450 lượt/ngày, ngày làm việc cao hơn cuối tuần),
 * để biểu đồ thống kê và bộ đếm truy cập có dữ liệu ngay khi trình diễn.
 */
export function buildVisits(now: Date, articles: VisitArticle[], catalog: VisitCatalog): VisitInsert[] {
  const r = prng(20261007);
  const hex = () => Math.floor(r.next() * 0xffffffff).toString(16).padStart(8, "0");
  const hours = HOUR_WEIGHTS.map((w, h) => [h, w] as const);
  const rows: VisitInsert[] = [];

  for (let d = DAYS - 1; d >= 0; d--) {
    const dayStart = at(now, d, 0);
    const weekday = new Date(dayStart.getTime() + 7 * 3_600_000).getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    const growth = 0.85 + 0.15 * (1 - d / DAYS);
    const total = weekend ? r.int(200, 260) : Math.round(r.int(320, 450) * growth);

    const visitors = Array.from({ length: Math.ceil(total * 0.62) }, () => `${hex()}${hex()}${hex()}`);
    const noon = at(now, d, 12).getTime();
    const candidates = articles
      .filter((a) => a.publishedAt.getTime() <= at(now, d, 23, 59).getTime())
      .map((a) => {
        const age = Math.max(0, (noon - a.publishedAt.getTime()) / 86_400_000);
        return [a, a.weight / (1 + age / 3)] as const;
      });

    for (let i = 0; i < total; i++) {
      let createdAt = at(now, d, r.weighted(hours), r.int(0, 59));
      createdAt = new Date(createdAt.getTime() + r.int(0, 59) * 1000);
      let kind = r.weighted(PATH_WEIGHTS);
      if (kind === "article" && candidates.length === 0) kind = "news";

      let path = "/";
      let articleId: number | null = null;
      switch (kind) {
        case "home": path = "/"; break;
        case "article": {
          const a = r.weighted(candidates);
          if (createdAt < a.publishedAt) createdAt = new Date(a.publishedAt.getTime() + r.int(5, 240) * 60_000);
          path = `/tin-tuc/${a.slug}`;
          articleId = a.id;
          break;
        }
        case "news": path = "/tin-tuc"; break;
        case "category": path = `/tin-tuc/chuyen-muc/${r.pick(catalog.categories)}`; break;
        case "about": path = "/gioi-thieu"; break;
        case "leaders": path = "/gioi-thieu/lanh-dao"; break;
        case "org": path = "/gioi-thieu/co-cau-to-chuc"; break;
        case "mandate": path = "/gioi-thieu/chuc-nang-nhiem-vu"; break;
        case "fields": path = "/linh-vuc"; break;
        case "field": path = `/linh-vuc/${r.pick(catalog.fields)}`; break;
        case "projects": path = "/nghien-cuu"; break;
        case "project": path = `/nghien-cuu/${r.pick(catalog.projects)}`; break;
        case "publications": path = "/cong-bo-khoa-hoc"; break;
        case "datasets": path = "/du-lieu-ai"; break;
        case "dataset": path = `/du-lieu-ai/${r.pick(catalog.datasets)}`; break;
        case "services": path = "/danh-gia-kiem-dinh"; break;
        case "service": path = `/danh-gia-kiem-dinh/${r.pick(catalog.services)}`; break;
        case "documents": path = "/van-ban"; break;
        case "document": path = `/van-ban/${r.pick(catalog.documents)}`; break;
        case "library": path = "/thu-vien"; break;
        case "album": path = `/thu-vien/${r.pick(catalog.albums)}`; break;
        case "contact": path = "/lien-he"; break;
        case "search": path = "/tim-kiem"; break;
      }
      if (createdAt > now) continue;

      const visitor = visitors[Math.floor(Math.pow(r.next(), 1.6) * visitors.length)]!;
      rows.push({
        path,
        section: sectionOf(path),
        articleId,
        referrerHost: r.weighted(REFERRERS),
        visitorHash: visitor,
        device: r.weighted(DEVICES),
        createdAt,
      });
    }
  }
  return rows;
}
