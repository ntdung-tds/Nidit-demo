import crypto from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { eq } from "drizzle-orm";
import { db, crawlItemsTable, crawlSourcesTable, type CrawlSourceRow } from "@workspace/db";
import { foldVietnamese, stripHtml, truncate } from "./text";

export const MAX_CRAWL_SOURCES = 5;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_ITEMS_PER_RUN = 40;
const MAX_FEED_BYTES = 3 * 1024 * 1024;

export interface CrawlRunResult {
  sourceId: number;
  sourceName: string;
  status: "ok" | "error";
  fetched: number;
  created: number;
  duplicates: number;
  filtered: number;
  message: string;
  ranAt: Date;
}

interface FeedEntry {
  title: string;
  link: string;
  guid: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  processEntities: true,
  htmlEntities: true,
  trimValues: true,
  parseTagValue: false,
});

type Node = unknown;

const asArray = (value: Node): Node[] => (value == null ? [] : Array.isArray(value) ? value : [value]);

function textOf(value: Node): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (Array.isArray(value)) return textOf(value[0]);
  if (typeof value === "object") {
    const obj = value as Record<string, Node>;
    if (obj["#text"] != null) return textOf(obj["#text"]);
  }
  return "";
}

function attr(value: Node, name: string): string | null {
  for (const node of asArray(value)) {
    if (node && typeof node === "object") {
      const v = (node as Record<string, Node>)[`@_${name}`];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

function firstImage(html: string): string | null {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return match?.[1] ?? null;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function absoluteUrl(url: string | null, base: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Đọc RSS 2.0, RSS 1.0 (RDF) và Atom thành danh sách tin */
export function parseFeed(xml: string, feedUrl: string): FeedEntry[] {
  const doc = parser.parse(xml) as Record<string, Node>;
  const entries: FeedEntry[] = [];
  const rss = doc["rss"] as Record<string, Node> | undefined;
  const rdf = doc["rdf:RDF"] as Record<string, Node> | undefined;
  const channelItems = rss
    ? asArray((rss["channel"] as Record<string, Node> | undefined)?.["item"])
    : rdf
      ? asArray(rdf["item"])
      : [];
  for (const raw of channelItems) {
    const item = raw as Record<string, Node>;
    const description = textOf(item["description"]) || textOf(item["content:encoded"]);
    const guidText = textOf(item["guid"]);
    const link = absoluteUrl(textOf(item["link"]) || (/^https?:\/\//i.test(guidText) ? guidText : "") || null, feedUrl);
    const title = stripHtml(textOf(item["title"]));
    if (!title || !link) continue;
    const enclosure = asArray(item["enclosure"]).find((e) => (attr(e, "type") ?? "image").startsWith("image"));
    const image =
      attr(item["media:content"], "url") ??
      attr(item["media:thumbnail"], "url") ??
      (enclosure ? attr(enclosure, "url") : null) ??
      firstImage(description);
    entries.push({
      title,
      link,
      guid: guidText || link,
      summary: description ? truncate(stripHtml(description), 500) || null : null,
      imageUrl: absoluteUrl(image, feedUrl),
      publishedAt: parseDate(textOf(item["pubDate"]) || textOf(item["dc:date"])),
    });
  }
  const feed = doc["feed"] as Record<string, Node> | undefined;
  for (const raw of feed ? asArray(feed["entry"]) : []) {
    const entry = raw as Record<string, Node>;
    const links = asArray(entry["link"]);
    const alternate = links.find((l) => (attr(l, "rel") ?? "alternate") === "alternate") ?? links[0];
    const link = absoluteUrl(attr(alternate, "href") ?? textOf(alternate), feedUrl);
    const title = stripHtml(textOf(entry["title"]));
    if (!title || !link) continue;
    const body = textOf(entry["summary"]) || textOf(entry["content"]);
    entries.push({
      title,
      link,
      guid: textOf(entry["id"]) || link,
      summary: body ? truncate(stripHtml(body), 500) || null : null,
      imageUrl: absoluteUrl(attr(entry["media:thumbnail"], "url") ?? attr(entry["media:content"], "url") ?? firstImage(body), feedUrl),
      publishedAt: parseDate(textOf(entry["published"]) || textOf(entry["updated"])),
    });
  }
  return entries;
}

/** So khớp từ khóa theo ranh giới từ, không phân biệt dấu */
export function matchKeywords(text: string, keywords: string[]): string[] {
  const folded = ` ${foldVietnamese(text).replace(/[^a-z0-9]+/g, " ")} `;
  return keywords.filter((kw) => {
    const k = foldVietnamese(kw).replace(/[^a-z0-9]+/g, " ").trim();
    return k.length > 0 && folded.includes(` ${k} `);
  });
}

async function fetchFeed(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NIDIT-Portal-Crawler/1.0)",
        Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.5",
      },
    });
    if (!res.ok) throw new Error(`Máy chủ nguồn trả về mã lỗi ${res.status}`);
    const body = await res.text();
    if (body.length > MAX_FEED_BYTES) throw new Error("Tệp RSS quá lớn");
    return body;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw new Error("Quá thời gian chờ phản hồi (15 giây)");
    if (err instanceof Error && err.message.startsWith("Máy chủ")) throw err;
    if (err instanceof Error && err.message === "Tệp RSS quá lớn") throw err;
    throw new Error("Không kết nối được tới địa chỉ RSS");
  } finally {
    clearTimeout(timer);
  }
}

export function validateFeedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "Địa chỉ RSS phải bắt đầu bằng http:// hoặc https://";
    return null;
  } catch {
    return "Địa chỉ RSS không hợp lệ";
  }
}

/** Thu thập một nguồn: tin mới vào hàng chờ, không bao giờ tự xuất bản */
export async function runCrawlSource(source: CrawlSourceRow): Promise<CrawlRunResult> {
  const ranAt = new Date();
  const result: CrawlRunResult = {
    sourceId: source.id,
    sourceName: source.name,
    status: "ok",
    fetched: 0,
    created: 0,
    duplicates: 0,
    filtered: 0,
    message: "",
    ranAt,
  };
  try {
    const xml = await fetchFeed(source.url);
    const entries = parseFeed(xml, source.url).slice(0, MAX_ITEMS_PER_RUN);
    if (!entries.length) throw new Error("Không đọc được tin nào (định dạng RSS/Atom không hợp lệ hoặc nguồn rỗng)");
    result.fetched = entries.length;
    for (const entry of entries) {
      const matched = source.keywords.length ? matchKeywords(`${entry.title} ${entry.summary ?? ""}`, source.keywords) : [];
      if (source.keywords.length && !matched.length) {
        result.filtered += 1;
        continue;
      }
      const inserted = await db
        .insert(crawlItemsTable)
        .values({
          sourceId: source.id,
          guidHash: crypto.createHash("sha1").update(entry.guid || entry.link).digest("hex"),
          title: entry.title,
          link: entry.link,
          summary: entry.summary,
          imageUrl: entry.imageUrl,
          publishedAt: entry.publishedAt,
          matchedKeywords: matched,
        })
        .onConflictDoNothing({ target: crawlItemsTable.guidHash })
        .returning({ id: crawlItemsTable.id });
      if (inserted.length) result.created += 1;
      else result.duplicates += 1;
    }
    const parts = [`Đọc ${result.fetched} tin`, `${result.created} tin mới vào hàng chờ`];
    if (result.duplicates) parts.push(`${result.duplicates} tin đã có`);
    if (result.filtered) parts.push(`${result.filtered} tin không khớp từ khóa`);
    result.message = parts.join(", ");
  } catch (err) {
    result.status = "error";
    result.message = err instanceof Error ? err.message : "Lỗi không xác định";
  }
  await db
    .update(crawlSourcesTable)
    .set({
      lastRunAt: ranAt,
      nextRunAt: new Date(ranAt.getTime() + source.intervalMinutes * 60_000),
      lastStatus: result.status,
      lastMessage: result.message,
    })
    .where(eq(crawlSourcesTable.id, source.id));
  return result;
}
