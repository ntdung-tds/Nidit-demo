import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db, datasetsTable, evaluationServicesTable, inquiriesTable, usersTable, type InquiryRow } from "@workspace/db";
import {
  CreateInquiryBody,
  CreateInquiryResponse,
  ListInquiriesQueryParams,
  ListInquiriesResponse,
  UpdateInquiryBody,
  UpdateInquiryParams,
  UpdateInquiryResponse,
} from "@workspace/api-zod";
import { getActor } from "../lib/auth";
import { badRequest, notFound, paging, parseInput, totalPages } from "../lib/http";
import { logActivity } from "../lib/activity";
import { rateLimit } from "../lib/rate-limit";
import { toInquiry } from "../lib/serializers";

const router: IRouter = Router();

const CODE_PREFIX: Record<string, string> = { contact: "LH", dataset_access: "DL", evaluation_request: "DG" };
const TYPE_LABEL: Record<string, string> = {
  contact: "liên hệ, góp ý",
  dataset_access: "yêu cầu khai thác dữ liệu",
  evaluation_request: "yêu cầu đánh giá, kiểm định",
};
const STATUS_LABEL: Record<string, string> = {
  new: "Mới tiếp nhận",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  rejected: "Từ chối",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function receiptCode(type: string): string {
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).replaceAll("-", "").slice(2);
  return `${CODE_PREFIX[type] ?? "YC"}-${day}-${crypto.randomInt(1000, 10000)}`;
}

export async function serializeInquiries(rows: InquiryRow[]) {
  const datasetIds = [...new Set(rows.map((r) => r.datasetId).filter((v): v is number => v != null))];
  const serviceIds = [...new Set(rows.map((r) => r.serviceId).filter((v): v is number => v != null))];
  const userIds = [...new Set(rows.map((r) => r.handledById).filter((v): v is number => v != null))];
  const [datasets, services, users] = await Promise.all([
    datasetIds.length
      ? db.select({ id: datasetsTable.id, title: datasetsTable.title }).from(datasetsTable).where(inArray(datasetsTable.id, datasetIds))
      : [],
    serviceIds.length
      ? db
          .select({ id: evaluationServicesTable.id, name: evaluationServicesTable.name })
          .from(evaluationServicesTable)
          .where(inArray(evaluationServicesTable.id, serviceIds))
      : [],
    userIds.length
      ? db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable).where(inArray(usersTable.id, userIds))
      : [],
  ]);
  const dMap = new Map(datasets.map((d) => [d.id, d.title]));
  const sMap = new Map(services.map((s) => [s.id, s.name]));
  const uMap = new Map(users.map((u) => [u.id, u.fullName]));
  return rows.map((r) =>
    toInquiry(r, {
      datasetTitle: r.datasetId ? (dMap.get(r.datasetId) ?? null) : null,
      serviceName: r.serviceId ? (sMap.get(r.serviceId) ?? null) : null,
      handledByName: r.handledById ? (uMap.get(r.handledById) ?? null) : null,
    }),
  );
}

router.post(
  "/inquiries",
  rateLimit({ windowMs: 10 * 60 * 1000, max: 8, message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau ít phút" }),
  async (req, res) => {
    const body = parseInput(CreateInquiryBody, req.body);
    const email = body.email.trim();
    if (!EMAIL_RE.test(email)) throw badRequest("Địa chỉ email không hợp lệ");
    if (body.message.trim().length < 5) throw badRequest("Nội dung quá ngắn");
    let datasetId: number | null = null;
    let serviceId: number | null = null;
    if (body.datasetId != null) {
      const [d] = await db.select({ id: datasetsTable.id }).from(datasetsTable).where(eq(datasetsTable.id, body.datasetId)).limit(1);
      if (!d) throw badRequest("Bộ dữ liệu không tồn tại");
      datasetId = d.id;
    }
    if (body.type === "dataset_access" && datasetId == null) throw badRequest("Vui lòng chọn bộ dữ liệu cần khai thác");
    if (body.serviceId != null) {
      const [s] = await db
        .select({ id: evaluationServicesTable.id })
        .from(evaluationServicesTable)
        .where(eq(evaluationServicesTable.id, body.serviceId))
        .limit(1);
      if (!s) throw badRequest("Dịch vụ không tồn tại");
      serviceId = s.id;
    }
    let row: InquiryRow | undefined;
    for (let attempt = 0; attempt < 5 && !row; attempt += 1) {
      [row] = await db
        .insert(inquiriesTable)
        .values({
          code: receiptCode(body.type),
          type: body.type,
          fullName: body.fullName.trim(),
          email,
          phone: body.phone?.trim() || null,
          organization: body.organization?.trim() || null,
          subject: body.subject?.trim() || null,
          message: body.message.trim(),
          datasetId,
          serviceId,
        })
        .onConflictDoNothing({ target: inquiriesTable.code })
        .returning();
    }
    if (!row) throw new Error("Không sinh được mã tiếp nhận");
    if (datasetId != null) {
      await db
        .update(datasetsTable)
        .set({ requestCount: sql`${datasetsTable.requestCount} + 1` })
        .where(eq(datasetsTable.id, datasetId));
    }
    res.status(201).json(
      CreateInquiryResponse.parse({
        id: row.id,
        code: row.code,
        type: row.type,
        createdAt: row.createdAt,
        message: `Viện đã tiếp nhận ${TYPE_LABEL[row.type] ?? "yêu cầu"} của Quý vị với mã ${row.code}. Kết quả sẽ được phản hồi qua email ${row.email} trong thời gian sớm nhất.`,
      }),
    );
  },
);

router.get("/admin/inquiries", async (req, res) => {
  const query = parseInput(ListInquiriesQueryParams, req.query);
  const { page, pageSize, offset } = paging(query.page, query.pageSize, 20);
  const typeCond = query.type ? eq(inquiriesTable.type, query.type) : undefined;
  const where = and(typeCond, query.status ? eq(inquiriesTable.status, query.status) : undefined);
  const [rows, [totalRow], statusRows] = await Promise.all([
    db.select().from(inquiriesTable).where(where).orderBy(desc(inquiriesTable.createdAt), desc(inquiriesTable.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(inquiriesTable).where(where),
    db.select({ status: inquiriesTable.status, n: count() }).from(inquiriesTable).where(typeCond).groupBy(inquiriesTable.status),
  ]);
  const total = Number(totalRow?.n ?? 0);
  res.json(
    ListInquiriesResponse.parse({
      items: await serializeInquiries(rows),
      total,
      page,
      pageSize,
      totalPages: totalPages(total, pageSize),
      statusCounts: statusRows.map((s) => ({ status: s.status, count: Number(s.n) })),
    }),
  );
});

router.patch("/admin/inquiries/:id", async (req, res) => {
  const actor = getActor(req);
  const { id } = parseInput(UpdateInquiryParams, req.params);
  const body = parseInput(UpdateInquiryBody, req.body);
  const [current] = await db.select().from(inquiriesTable).where(eq(inquiriesTable.id, id)).limit(1);
  if (!current) throw notFound("Không tìm thấy yêu cầu");
  const [row] = await db
    .update(inquiriesTable)
    .set({
      status: body.status ?? current.status,
      adminNote: body.adminNote === undefined ? current.adminNote : body.adminNote?.trim() || null,
      handledById: actor.id,
      updatedAt: new Date(),
    })
    .where(eq(inquiriesTable.id, id))
    .returning();
  const statusChanged = body.status && body.status !== current.status;
  await logActivity(actor, {
    action: "update",
    actionLabel: statusChanged ? "Cập nhật trạng thái yêu cầu" : "Ghi chú xử lý yêu cầu",
    entityType: "inquiry",
    entityId: id,
    entityTitle: `${row!.code} – ${row!.fullName}`,
    detail: statusChanged ? `${STATUS_LABEL[current.status] ?? current.status} → ${STATUS_LABEL[row!.status] ?? row!.status}` : null,
  });
  const [item] = await serializeInquiries([row!]);
  res.json(UpdateInquiryResponse.parse(item));
});

export default router;
