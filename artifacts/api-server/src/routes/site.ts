import crypto from "node:crypto";
import { Router, type IRouter, type Request } from "express";
import { eq, sql } from "drizzle-orm";
import { db, articlesTable, siteSettingsTable, visitsTable } from "@workspace/db";
import {
  GetSiteSettingsResponse,
  GetVisitCounterResponse,
  TrackVisitBody,
  UpdateSiteSettingsBody,
  UpdateSiteSettingsResponse,
} from "@workspace/api-zod";
import { getActor, requireRole } from "../lib/auth";
import { HttpError, parseInput } from "../lib/http";
import { logActivity } from "../lib/activity";
import { toSiteSettings } from "../lib/serializers";

const router: IRouter = Router();

export async function loadSettings() {
  const [row] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1)).limit(1);
  if (!row) throw new HttpError(500, "Chưa có cấu hình trang");
  return row;
}

router.get("/site-settings", async (_req, res) => {
  res.json(GetSiteSettingsResponse.parse(toSiteSettings(await loadSettings())));
});

router.patch("/admin/site-settings", requireRole("admin"), async (req, res) => {
  const actor = getActor(req);
  const body = parseInput(UpdateSiteSettingsBody, req.body);
  await loadSettings();
  const patch: Partial<typeof siteSettingsTable.$inferInsert> = { updatedAt: new Date() };
  for (const [key, value] of Object.entries(body) as [keyof typeof body, unknown][]) {
    if (value === undefined) continue;
    if (key === "demoNotice" || key === "mapEmbedUrl" || key === "facebookUrl" || key === "youtubeUrl") {
      const text = typeof value === "string" ? value.trim() : null;
      patch[key] = text ? text : null;
    } else {
      (patch as Record<string, unknown>)[key] = value;
    }
  }
  const [row] = await db.update(siteSettingsTable).set(patch).where(eq(siteSettingsTable.id, 1)).returning();
  await logActivity(actor, {
    action: "update_settings",
    actionLabel: "Cập nhật cấu hình trang",
    entityType: "settings",
    detail: `Các trường: ${Object.keys(body).join(", ")}`,
  });
  res.json(UpdateSiteSettingsResponse.parse(toSiteSettings(row!)));
});

const VN_DAY = sql`(date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')`;
const VN_MONTH = sql`(date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')`;

router.get("/visit-counter", async (_req, res) => {
  const [row] = await db
    .select({
      online: sql<number>`count(distinct ${visitsTable.visitorHash}) filter (where ${visitsTable.createdAt} > now() - interval '5 minutes')`,
      today: sql<number>`count(*) filter (where ${visitsTable.createdAt} >= ${VN_DAY})`,
      thisMonth: sql<number>`count(*) filter (where ${visitsTable.createdAt} >= ${VN_MONTH})`,
      total: sql<number>`count(*)`,
    })
    .from(visitsTable);
  res.json(
    GetVisitCounterResponse.parse({
      online: Math.max(1, Number(row?.online ?? 0)),
      today: Number(row?.today ?? 0),
      thisMonth: Number(row?.thisMonth ?? 0),
      total: Number(row?.total ?? 0),
    }),
  );
});

const SECTIONS: [RegExp, string][] = [
  [/^\/$/, "Trang chủ"],
  [/^\/tin-tuc/, "Tin tức – Sự kiện"],
  [/^\/gioi-thieu|^\/trang\//, "Giới thiệu"],
  [/^\/linh-vuc/, "Lĩnh vực hoạt động"],
  [/^\/nghien-cuu/, "Nghiên cứu – Dự án"],
  [/^\/cong-bo-khoa-hoc/, "Công bố khoa học"],
  [/^\/du-lieu-ai/, "Dữ liệu phục vụ AI"],
  [/^\/danh-gia-kiem-dinh/, "Đánh giá – Kiểm định"],
  [/^\/van-ban/, "Văn bản – Tài liệu"],
  [/^\/thu-vien/, "Thư viện"],
  [/^\/lien-he/, "Liên hệ"],
  [/^\/tim-kiem/, "Tìm kiếm"],
];

export function sectionOf(path: string): string {
  return SECTIONS.find(([re]) => re.test(path))?.[1] ?? "Khác";
}

export function deviceOf(userAgent: string): string {
  if (/ipad|tablet/i.test(userAgent)) return "Máy tính bảng";
  if (/mobi|android|iphone/i.test(userAgent)) return "Điện thoại";
  return "Máy tính";
}

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

router.post("/track", async (req, res) => {
  const body = parseInput(TrackVisitBody, req.body);
  const userAgent = String(req.headers["user-agent"] ?? "");
  if (/bot|crawler|spider|headless/i.test(userAgent)) {
    res.status(204).end();
    return;
  }
  const path = (body.path.split("?")[0] ?? "/").slice(0, 300) || "/";
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = crypto
    .createHash("sha256")
    .update(`${clientIp(req)}|${userAgent}|${day}`)
    .digest("hex")
    .slice(0, 24);
  let referrerHost: string | null = null;
  if (body.referrer) {
    try {
      const host = new URL(body.referrer).hostname;
      const ownHost = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").split(":")[0];
      referrerHost = host && host !== ownHost ? host.replace(/^www\./, "") : null;
    } catch {
      referrerHost = null;
    }
  }
  await db.insert(visitsTable).values({
    path,
    section: sectionOf(path),
    articleId: body.articleId ?? null,
    referrerHost,
    visitorHash,
    device: deviceOf(userAgent),
  });
  if (body.articleId) {
    await db
      .update(articlesTable)
      .set({ viewCount: sql`${articlesTable.viewCount} + 1` })
      .where(eq(articlesTable.id, body.articleId));
  }
  res.status(204).end();
});

export default router;
