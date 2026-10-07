import type { ErrorRequestHandler } from "express";
import type { ZodTypeAny, z } from "zod";

/** Lỗi nghiệp vụ trả về cho client dưới dạng { error } */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (message = "Không tìm thấy dữ liệu") => new HttpError(404, message);
export const badRequest = (message: string) => new HttpError(400, message);
export const forbidden = (message = "Bạn không có quyền thực hiện thao tác này") =>
  new HttpError(403, message);

/** Kiểm tra dữ liệu đầu vào bằng schema sinh từ OpenAPI; sai thì trả 400 */
export function parseInput<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? issue.path.join(".") : "dữ liệu";
    throw new HttpError(400, `Dữ liệu không hợp lệ (${where}): ${issue?.message ?? "sai định dạng"}`);
  }
  return result.data;
}

/** Tính phân trang */
export function paging(page: number | undefined, pageSize: number | undefined, fallbackSize = 12) {
  const p = Math.max(1, page ?? 1);
  const size = Math.min(100, Math.max(1, pageSize ?? fallbackSize));
  return { page: p, pageSize: size, offset: (p - 1) * size };
}

export function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

type PgLikeError = { code?: string; cause?: { code?: string } };

function pgCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const e = err as PgLikeError;
  return e.code ?? e.cause?.code;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (typeof err === "object" && err !== null && (err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ error: "Nội dung yêu cầu không phải JSON hợp lệ" });
    return;
  }
  const code = pgCode(err);
  if (code === "23505") {
    res.status(409).json({ error: "Dữ liệu bị trùng (đường dẫn hoặc mã đã tồn tại)" });
    return;
  }
  if (code === "23503") {
    res.status(400).json({ error: "Dữ liệu đang được tham chiếu hoặc tham chiếu không hợp lệ" });
    return;
  }
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Lỗi máy chủ, vui lòng thử lại sau" });
};
