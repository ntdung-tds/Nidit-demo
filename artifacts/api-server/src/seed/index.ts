import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import {
  db,
  activityFieldsTable,
  activityLogsTable,
  albumsTable,
  articleHistoryTable,
  articlesTable,
  categoriesTable,
  crawlItemsTable,
  crawlSourcesTable,
  datasetsTable,
  documentsTable,
  evaluationServicesTable,
  inquiriesTable,
  leadersTable,
  mediaTable,
  menuItemsTable,
  orgUnitsTable,
  projectsTable,
  publicationsTable,
  siteSettingsTable,
  staticPagesTable,
  usersTable,
  visitsTable,
  type UserRow,
} from "@workspace/db";
import { logger } from "../lib/logger";
import { slugify } from "../lib/text";
import { ACTIVITY_LABEL } from "../lib/workflow";
import { CATEGORIES, FOOTER_MENU, LEADERS, LINK_MENU, MAIN_MENU, ORG_UNITS, PAGES, SETTINGS, USERS, type UserKey } from "./core";
import { DOCUMENTS } from "./documents";
import { at, dateStr, html, img, prng, type Tx } from "./helpers";
import { ALBUMS, CRAWL_SOURCES, IMAGE_TITLES, INQUIRIES } from "./library";
import { ARTICLES, type SeedArticle, type SeedArticleStatus } from "./news";
import { accessMethods, DATASETS, FIELDS, PROJECTS, PUBLICATIONS, SERVICES } from "./research";
import { FILE_SIZES } from "./sample-files";
import { buildVisits, type VisitArticle } from "./visits";

const MIN = 60_000;
const HOUR = 3_600_000;

type ActivityInsert = typeof activityLogsTable.$inferInsert;
type HistoryInsert = typeof articleHistoryTable.$inferInsert;
type MenuSeed = (typeof MAIN_MENU)[number];

/**
 * Khởi tạo dữ liệu mẫu khi CSDL còn trống (lần chạy đầu ở môi trường phát triển hoặc bản xuất bản).
 * Dùng khóa tư vấn trong giao dịch để nhiều tiến trình khởi động cùng lúc không khởi tạo trùng.
 */
export async function ensureSeeded(): Promise<void> {
  const seeded = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7240611)`);
    const existing = await tx.select({ id: siteSettingsTable.id }).from(siteSettingsTable).where(eq(siteSettingsTable.id, 1)).limit(1);
    if (existing.length > 0) return false;
    await seedAll(tx, new Date());
    return true;
  });
  if (seeded) logger.info("Đã khởi tạo dữ liệu mẫu cho bản demo");
}

async function seedAll(tx: Tx, now: Date): Promise<void> {
  const r = prng(7240);
  const nowMs = now.getTime();
  /** Không để mốc thời gian vượt quá hiện tại */
  const past = (d: Date) => (d.getTime() >= nowMs ? new Date(nowMs - r.int(3, 40) * MIN) : d);
  const activity: ActivityInsert[] = [];
  const log = (actor: UserRow | null, createdAt: Date, e: Omit<ActivityInsert, "actorId" | "actorName" | "actorRole" | "createdAt">) => {
    activity.push({ actorId: actor?.id ?? null, actorName: actor?.fullName ?? "Hệ thống", actorRole: actor?.role ?? null, createdAt: past(createdAt), ...e });
  };

  /* ---------------------------- Cấu hình, tài khoản ---------------------------- */
  await tx.insert(siteSettingsTable).values({ ...SETTINGS, updatedAt: at(now, 2, 16, 20) });

  const userRows = await tx
    .insert(usersTable)
    .values(USERS.map((u) => ({ fullName: u.fullName, email: u.email, role: u.role, title: u.title, unit: u.unit, isActive: u.isActive, createdAt: at(now, 160, 9) })))
    .returning();
  const byEmail = new Map(userRows.map((u) => [u.email, u]));
  const U = Object.fromEntries(USERS.map((u) => [u.key, byEmail.get(u.email)!])) as Record<UserKey, UserRow>;

  /* ---------------------------- Chuyên mục, menu, trang ---------------------------- */
  const catId = new Map<string, number>();
  const parentCats = await tx
    .insert(categoriesTable)
    .values(CATEGORIES.filter((c) => !c.parent).map((c) => ({ slug: c.slug, name: c.name, nameEn: c.nameEn, description: c.description, sortOrder: c.sortOrder })))
    .returning({ id: categoriesTable.id, slug: categoriesTable.slug });
  parentCats.forEach((c) => catId.set(c.slug, c.id));
  const childCats = await tx
    .insert(categoriesTable)
    .values(
      CATEGORIES.filter((c) => c.parent).map((c) => ({
        slug: c.slug,
        name: c.name,
        nameEn: c.nameEn,
        description: c.description,
        sortOrder: c.sortOrder,
        parentId: need(catId, c.parent!, "chuyên mục"),
      })),
    )
    .returning({ id: categoriesTable.id, slug: categoriesTable.slug });
  childCats.forEach((c) => catId.set(c.slug, c.id));

  const insertMenu = async (items: MenuSeed[], location: "main" | "footer" | "links", parentId: number | null) => {
    for (const [i, m] of items.entries()) {
      const [row] = await tx
        .insert(menuItemsTable)
        .values({ label: m.label, labelEn: m.labelEn, url: m.url, location, parentId, sortOrder: i + 1, openInNewTab: m.newTab ?? false })
        .returning({ id: menuItemsTable.id });
      if (m.children?.length) await insertMenu(m.children, location, row!.id);
    }
  };
  await insertMenu(MAIN_MENU, "main", null);
  await insertMenu(FOOTER_MENU, "footer", null);
  await insertMenu(LINK_MENU, "links", null);

  await tx.insert(staticPagesTable).values(
    PAGES.map((p) => ({
      slug: p.slug,
      title: p.title,
      titleEn: p.titleEn,
      summary: p.summary,
      content: p.content,
      contentEn: p.contentEn,
      status: ("status" in p && p.status) || "published",
      updatedAt: at(now, r.int(12, 45), 10, r.int(0, 59)),
      updatedById: U.huong.id,
    })),
  );
  await tx.insert(orgUnitsTable).values(ORG_UNITS);
  await tx.insert(leadersTable).values(LEADERS);

  /* ---------------------------- Lĩnh vực, nghiên cứu, dữ liệu ---------------------------- */
  const fieldRows = await tx
    .insert(activityFieldsTable)
    .values(FIELDS.map((f, i) => ({ ...f, sortOrder: i + 1 })))
    .returning({ id: activityFieldsTable.id, slug: activityFieldsTable.slug });
  const fieldId = new Map(fieldRows.map((f) => [f.slug, f.id]));

  const projectRows = await tx
    .insert(projectsTable)
    .values(
      PROJECTS.map((p, i) => {
        const { field, ...rest } = p;
        return { ...rest, fieldId: need(fieldId, field, "lĩnh vực"), createdAt: at(now, 420 - i * 30, 9), updatedAt: at(now, r.int(4, 60), 15) };
      }),
    )
    .returning({ id: projectsTable.id, slug: projectsTable.slug });
  const projectId = new Map(projectRows.map((p) => [p.slug, p.id]));

  await tx.insert(publicationsTable).values(
    PUBLICATIONS.map((p, i) => {
      const { field, project, url, ...rest } = p;
      return {
        ...rest,
        url: url ?? null,
        doi: null,
        fieldId: need(fieldId, field, "lĩnh vực"),
        projectId: project ? need(projectId, project, "đề tài") : null,
        createdAt: at(now, 320 - i * 14, 10),
      };
    }),
  );

  const datasetRows = await tx
    .insert(datasetsTable)
    .values(
      DATASETS.map((d) => {
        const { field, issuedDaysAgo, ...rest } = d;
        return {
          ...rest,
          fieldId: need(fieldId, field, "lĩnh vực"),
          publisher: SETTINGS.siteName,
          contactEmail: "dulieu@nidit.gov.vn",
          accessMethods: accessMethods(d.slug, d.accessLevel),
          issuedDate: dateStr(now, issuedDaysAgo),
          createdAt: at(now, issuedDaysAgo, 9),
          updatedAt: at(now, Math.max(2, Math.floor(issuedDaysAgo / 3)), 14, r.int(0, 59)),
        };
      }),
    )
    .returning({ id: datasetsTable.id, slug: datasetsTable.slug, title: datasetsTable.title });
  const datasetId = new Map(datasetRows.map((d) => [d.slug, d.id]));

  const serviceRows = await tx
    .insert(evaluationServicesTable)
    .values(
      SERVICES.map((s, i) => {
        const { field, ...rest } = s;
        return { ...rest, fieldId: need(fieldId, field, "lĩnh vực"), contactEmail: "kiemdinh@nidit.gov.vn", sortOrder: i + 1 };
      }),
    )
    .returning({ id: evaluationServicesTable.id, slug: evaluationServicesTable.slug });
  const serviceId = new Map(serviceRows.map((s) => [s.slug, s.id]));

  /* ---------------------------- Văn bản, thư viện, tư liệu ---------------------------- */
  const launch = at(now, 200, 9);
  const documentRows = await tx
    .insert(documentsTable)
    .values(
      DOCUMENTS.map((d) => {
        const issued = new Date(`${d.issuedDate}T10:00:00+07:00`);
        return {
          number: d.number,
          title: d.title,
          docType: d.docType,
          docGroup: d.docGroup,
          issuer: d.issuer,
          signer: d.signer,
          issuedDate: d.issuedDate,
          effectiveDate: d.effectiveDate,
          fieldId: d.field ? need(fieldId, d.field, "lĩnh vực") : null,
          projectId: d.project ? need(projectId, d.project, "đề tài") : null,
          summary: d.summary,
          fileUrl: `/files/${d.fileName}`,
          fileName: d.fileName,
          fileSize: FILE_SIZES[d.fileName] ?? null,
          fileFormat: "PDF",
          downloadCount: d.downloadCount,
          createdAt: past(issued > launch ? new Date(issued.getTime() + 6 * HOUR) : launch),
        };
      }),
    )
    .returning({ id: documentsTable.id, title: documentsTable.title, number: documentsTable.number, createdAt: documentsTable.createdAt });

  await tx.insert(albumsTable).values(
    ALBUMS.map((a) => ({
      slug: a.slug,
      title: a.title,
      type: a.type,
      description: a.description,
      coverImage: a.coverImage,
      eventDate: dateStr(now, a.daysAgo),
      items: a.items,
      createdAt: at(now, a.daysAgo, 17, 30),
    })),
  );
  const albumRows = await tx.select({ id: albumsTable.id, title: albumsTable.title, createdAt: albumsTable.createdAt }).from(albumsTable);

  await tx.insert(mediaTable).values([
    ...Object.entries(IMAGE_TITLES).map(([name, title], i) => ({
      url: img(name),
      title,
      alt: `${title} (ảnh minh họa)`,
      type: "image",
      createdAt: at(now, 70 - i * 3, 10, r.int(0, 59)),
    })),
    { url: "/videos/toan-canh-hoi-thao.mp4", title: "Video toàn cảnh Hội thảo “Dữ liệu mở phục vụ phát triển AI”", alt: null, type: "video", createdAt: at(now, 5, 16) },
    { url: "/videos/phong-thi-nghiem-ai.mp4", title: "Video giới thiệu Phòng thí nghiệm Trí tuệ nhân tạo", alt: null, type: "video", createdAt: at(now, 5, 16, 10) },
    ...documentRows.map((d) => ({
      url: `/files/${DOCUMENTS.find((x) => x.number === d.number)!.fileName}`,
      title: `${d.number} – ${d.title}`,
      alt: null,
      type: "file",
      createdAt: d.createdAt,
    })),
  ]);

  /* ---------------------------- Tin bài và lịch sử biên tập ---------------------------- */
  const usedSlugs = new Set<string>();
  const slugFor = (title: string) => {
    const base = slugify(title, "tin-bai");
    let slug = base;
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`;
    usedSlugs.add(slug);
    return slug;
  };

  const history: (Omit<HistoryInsert, "articleId"> & { key: number })[] = [];
  const insertedArticles: { id: number; slug: string; seed: SeedArticle; status: SeedArticleStatus; publishedAt: Date | null }[] = [];

  for (const [index, a] of ARTICLES.entries()) {
    const status = a.status ?? "published";
    const creator = U[a.createdBy];
    const publisher = r.next() < 0.7 ? U.huong : U.nam;
    const planned = at(now, a.daysAgo, a.hour ?? 8, r.int(0, 50));
    let createdAt: Date;
    let publishedAt: Date | null = null;
    if (status === "published" || status === "unpublished") {
      publishedAt = past(planned);
      createdAt = new Date(publishedAt.getTime() - r.int(18, 30) * HOUR);
    } else if (status === "scheduled") {
      publishedAt = planned;
      createdAt = past(at(now, 1, 14, r.int(0, 40)));
    } else {
      createdAt = past(planned);
    }
    const unpublishAt = a.unpublishInDays !== undefined && publishedAt ? at(now, -a.unpublishInDays, 17) : null;

    // Lịch sử thao tác theo đúng quy trình: tạo → gửi duyệt → duyệt → xuất bản
    const steps: { action: string; fromStatus: string | null; toStatus: string; actor: UserRow | null; at: Date; note: string | null }[] = [];
    const step = (action: string, fromStatus: string | null, toStatus: string, actor: UserRow | null, t: Date, note: string | null = null) =>
      steps.push({ action, fromStatus, toStatus, actor, at: past(t), note });
    step("create", null, "draft", creator, createdAt, a.origin === "crawler" ? `Tạo từ tin tự động (${a.sourceName})` : null);
    const submitAt = new Date(createdAt.getTime() + r.int(40, 150) * MIN);
    if (status === "published" || status === "unpublished") {
      step("submit", "draft", "pending", creator, submitAt);
      step("approve", "pending", "approved", U.huong, new Date(publishedAt!.getTime() - r.int(20, 90) * MIN), a.reviewerNote ?? null);
      step("publish", "approved", "published", publisher, publishedAt!, unpublishAt ? `Tự động gỡ lúc ${fmtTime(unpublishAt)}` : null);
      if (status === "unpublished") step("auto_unpublish", "published", "unpublished", null, at(now, Math.max(0, a.daysAgo - 4), 17), "Tự động gỡ bài khi hết thời hạn hiển thị");
    } else if (status === "scheduled") {
      step("submit", "draft", "pending", creator, submitAt);
      step("approve", "pending", "approved", U.huong, new Date(submitAt.getTime() + 70 * MIN));
      step("publish", "approved", "scheduled", U.nam, new Date(submitAt.getTime() + 95 * MIN), `Hẹn giờ xuất bản lúc ${fmtTime(publishedAt!)}`);
    } else if (status === "pending") {
      step("submit", "draft", "pending", creator, submitAt);
    } else if (status === "changes_requested") {
      step("submit", "draft", "pending", creator, submitAt);
      step("request_changes", "pending", "changes_requested", U.huong, new Date(submitAt.getTime() + 150 * MIN), a.reviewerNote ?? null);
    } else if (status === "approved") {
      step("submit", "draft", "pending", creator, submitAt);
      step("approve", "pending", "approved", U.huong, new Date(submitAt.getTime() + 100 * MIN), a.reviewerNote ?? null);
    }

    const [row] = await tx
      .insert(articlesTable)
      .values({
        title: a.title,
        slug: slugFor(a.title),
        summary: a.summary,
        content: html(a.body),
        status,
        categoryId: need(catId, a.category, "chuyên mục"),
        language: a.lang ?? "vi",
        coverImage: a.image ? img(a.image) : null,
        coverCaption: a.caption ?? null,
        authorName: a.author,
        keywords: a.keywords,
        tags: a.tags ?? [],
        sourceName: a.sourceName ?? null,
        sourceUrl: a.sourceUrl ?? null,
        isFeatured: a.featured ?? false,
        eventStartAt: a.event ? at(now, -a.event.inDays, a.event.hour) : null,
        eventLocation: a.event?.location ?? null,
        createdById: creator.id,
        createdAt: steps[0]!.at,
        updatedAt: steps[steps.length - 1]!.at,
        publishedAt,
        unpublishAt,
        viewCount: status === "published" || status === "unpublished" ? (a.views ?? 0) : 0,
        origin: a.origin ?? "manual",
        reviewerNote: status === "changes_requested" || status === "approved" ? (a.reviewerNote ?? null) : null,
      })
      .returning({ id: articlesTable.id, slug: articlesTable.slug });
    insertedArticles.push({ id: row!.id, slug: row!.slug, seed: a, status, publishedAt });

    for (const s of steps) {
      history.push({
        key: index,
        action: s.action,
        fromStatus: s.fromStatus,
        toStatus: s.toStatus,
        actorId: s.actor?.id ?? null,
        actorName: s.actor?.fullName ?? "Hệ thống",
        actorRole: s.actor?.role ?? null,
        note: s.note,
        createdAt: s.at,
      });
      // Nhật ký thao tác cho các bước gần đây (2 tuần)
      if (nowMs - s.at.getTime() > 14 * 86_400_000) continue;
      const entity = { entityType: "article", entityId: row!.id, entityTitle: a.title };
      if (s.action === "create") {
        if (a.origin === "crawler") log(s.actor, s.at, { action: "import", actionLabel: "Chuyển tin tự động thành bài nháp", entityType: "crawl", entityId: row!.id, entityTitle: a.title, detail: a.sourceName ?? null });
        else log(s.actor, s.at, { action: "create", actionLabel: "Tạo bài viết", ...entity });
      } else if (s.action === "auto_unpublish") {
        log(null, s.at, { action: "auto_unpublish", actionLabel: "Tự động gỡ bài hết hạn", ...entity });
      } else {
        const label = s.toStatus === "scheduled" ? "Hẹn giờ xuất bản bài viết" : ACTIVITY_LABEL[s.action as keyof typeof ACTIVITY_LABEL];
        log(s.actor, s.at, { action: s.action, actionLabel: label, ...entity, detail: s.note });
      }
    }
  }
  await tx.insert(articleHistoryTable).values(history.map(({ key, ...h }) => ({ ...h, articleId: insertedArticles[key]!.id })));

  /* ---------------------------- Nguồn tin tự động ---------------------------- */
  const sourceRows = await tx
    .insert(crawlSourcesTable)
    .values(
      CRAWL_SOURCES.map((s, i) => ({
        name: s.name,
        url: s.url,
        categoryId: need(catId, s.category, "chuyên mục"),
        intervalMinutes: s.intervalMinutes,
        keywords: s.keywords,
        nextRunAt: new Date(nowMs + s.startInMinutes * MIN),
        lastStatus: "never",
        createdAt: at(now, 6, 10, i * 4),
      })),
    )
    .returning({ id: crawlSourcesTable.id, name: crawlSourcesTable.name, url: crawlSourcesTable.url, createdAt: crawlSourcesTable.createdAt });
  for (const s of sourceRows) log(U.nam, s.createdAt, { action: "create", actionLabel: "Thêm nguồn tin tự động", entityType: "crawl", entityId: s.id, entityTitle: s.name, detail: s.url });

  const crawlerDraft = insertedArticles.find((a) => a.seed.origin === "crawler");
  if (crawlerDraft) {
    const source = sourceRows.find((s) => s.name === crawlerDraft.seed.sourceName);
    if (source) {
      const link = crawlerDraft.seed.sourceUrl ?? source.url;
      const createdAt = history.find((h) => h.key === insertedArticles.indexOf(crawlerDraft))!.createdAt!;
      await tx.insert(crawlItemsTable).values({
        sourceId: source.id,
        guidHash: crypto.createHash("sha1").update(`seed:${link}`).digest("hex"),
        title: crawlerDraft.seed.title,
        link,
        summary: "Nhiều doanh nghiệp đang thử nghiệm trợ lý ảo dùng AI tạo sinh để trả lời khách hàng.",
        publishedAt: new Date(createdAt.getTime() - 2 * HOUR),
        fetchedAt: new Date(createdAt.getTime() - 40 * MIN),
        status: "imported",
        articleId: crawlerDraft.id,
        matchedKeywords: ["AI", "trí tuệ nhân tạo"],
      });
    }
  }

  /* ---------------------------- Yêu cầu từ người dân, tổ chức ---------------------------- */
  const STATUS_TEXT: Record<string, string> = { processing: "Đang xử lý", resolved: "Đã xử lý", rejected: "Từ chối" };
  for (const [i, q] of INQUIRIES.entries()) {
    const createdAt = past(at(now, q.daysAgo, q.hour, r.int(0, 59)));
    const ymd = createdAt.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).slice(2).replace(/-/g, "");
    const handler = q.handledBy ? U[q.handledBy] : null;
    const updatedAt = handler ? past(new Date(createdAt.getTime() + r.int(3, 26) * HOUR)) : createdAt;
    const [row] = await tx
      .insert(inquiriesTable)
      .values({
        code: `${q.code}-${ymd}-${String(1000 + i * 1373 + r.int(0, 999)).padStart(4, "0").slice(-4)}`,
        type: q.type,
        fullName: q.fullName,
        email: q.email,
        phone: q.phone,
        organization: q.organization,
        subject: q.subject,
        message: q.message,
        datasetId: q.dataset ? need(datasetId, q.dataset, "bộ dữ liệu") : null,
        serviceId: q.service ? need(serviceId, q.service, "dịch vụ") : null,
        status: q.status,
        adminNote: q.adminNote ?? null,
        handledById: handler?.id ?? null,
        createdAt,
        updatedAt,
      })
      .returning({ id: inquiriesTable.id });
    if (handler) {
      log(handler, updatedAt, {
        action: "update",
        actionLabel: "Cập nhật trạng thái yêu cầu",
        entityType: "inquiry",
        entityId: row!.id,
        entityTitle: q.subject,
        detail: STATUS_TEXT[q.status] ?? null,
      });
    }
  }

  /* ---------------------------- Nhật ký đăng nhập và thao tác khác ---------------------------- */
  const lastLogin = new Map<UserKey, Date>();
  const LOGIN_PLAN: [UserKey, number, number][] = [
    ["nam", 0.95, 7],
    ["huong", 0.85, 8],
    ["ha", 0.9, 8],
    ["minh", 0.55, 9],
  ];
  for (let d = 20; d >= 0; d--) {
    const weekday = new Date(at(now, d, 12).getTime() + 7 * HOUR).getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    for (const [key, chance, hour] of LOGIN_PLAN) {
      if (r.next() > (weekend ? chance * 0.2 : chance)) continue;
      const t = at(now, d, hour, r.int(5, 55));
      if (t.getTime() >= nowMs) continue;
      log(U[key], t, { action: "login", actionLabel: "Đăng nhập hệ thống quản trị", entityType: "auth" });
      lastLogin.set(key, t);
    }
  }
  const ducLogin = at(now, 46, 9, 12);
  log(U.duc, ducLogin, { action: "login", actionLabel: "Đăng nhập hệ thống quản trị", entityType: "auth" });
  lastLogin.set("duc", ducLogin);
  for (const [key, t] of lastLogin) await tx.update(usersTable).set({ lastLoginAt: t }).where(eq(usersTable.id, U[key].id));

  log(U.nam, at(now, 2, 16, 20), { action: "update", actionLabel: "Cập nhật cấu hình trang", entityType: "settings", entityId: 1, entityTitle: "Cấu hình chung" });
  log(U.nam, at(now, 12, 9, 40), { action: "update", actionLabel: "Cập nhật mục menu", entityType: "menu", entityTitle: "Đánh giá – Kiểm định" });
  log(U.nam, at(now, 44, 10, 5), { action: "update", actionLabel: "Khóa tài khoản", entityType: "user", entityId: U.duc.id, entityTitle: U.duc.fullName });
  for (const [i, d] of datasetRows.slice(0, 3).entries()) {
    log(U.minh, at(now, 3 + i * 5, 15, r.int(0, 59)), { action: "update", actionLabel: "Cập nhật bộ dữ liệu", entityType: "dataset", entityId: d.id, entityTitle: d.title });
  }
  for (const d of documentRows.filter((x) => nowMs - x.createdAt.getTime() < 14 * 86_400_000)) {
    log(U.ha, d.createdAt, { action: "create", actionLabel: "Thêm văn bản", entityType: "document", entityId: d.id, entityTitle: `${d.number} – ${d.title}` });
  }
  for (const a of albumRows.filter((x) => nowMs - x.createdAt.getTime() < 14 * 86_400_000)) {
    log(U.ha, a.createdAt, { action: "create", actionLabel: "Tạo album", entityType: "album", entityId: a.id, entityTitle: a.title });
  }
  activity.sort((x, y) => x.createdAt!.getTime() - y.createdAt!.getTime());
  for (let i = 0; i < activity.length; i += 500) await tx.insert(activityLogsTable).values(activity.slice(i, i + 500));

  /* ---------------------------- Lượt truy cập ---------------------------- */
  const visitArticles: VisitArticle[] = insertedArticles
    .filter((a) => a.status === "published" && a.publishedAt)
    .map((a) => ({ id: a.id, slug: a.slug, publishedAt: a.publishedAt!, weight: Math.max(60, a.seed.views ?? 0) }));
  const visits = buildVisits(now, visitArticles, {
    categories: CATEGORIES.map((c) => c.slug),
    fields: FIELDS.map((f) => f.slug),
    projects: PROJECTS.map((p) => p.slug),
    datasets: DATASETS.map((d) => d.slug),
    services: SERVICES.map((s) => s.slug),
    documents: documentRows.map((d) => d.id),
    albums: ALBUMS.map((a) => a.slug),
  });
  for (let i = 0; i < visits.length; i += 2000) await tx.insert(visitsTable).values(visits.slice(i, i + 2000));

  // Lượt xem của bài không thấp hơn số lượt truy cập đã ghi nhận
  const perArticle = new Map<number, number>();
  for (const v of visits) if (v.articleId) perArticle.set(v.articleId, (perArticle.get(v.articleId) ?? 0) + 1);
  for (const a of visitArticles) {
    const counted = perArticle.get(a.id) ?? 0;
    const seedViews = insertedArticles.find((x) => x.id === a.id)!.seed.views ?? 0;
    if (counted > seedViews) await tx.update(articlesTable).set({ viewCount: counted }).where(eq(articlesTable.id, a.id));
  }

  logger.info(
    { articles: insertedArticles.length, documents: documentRows.length, datasets: datasetRows.length, visits: visits.length, activity: activity.length },
    "Seed data inserted",
  );
}

function need<T>(map: Map<string, T>, key: string, label: string): T {
  const value = map.get(key);
  if (value === undefined) throw new Error(`Dữ liệu mẫu tham chiếu ${label} không tồn tại: ${key}`);
  return value;
}

function fmtTime(d: Date): string {
  return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
}
