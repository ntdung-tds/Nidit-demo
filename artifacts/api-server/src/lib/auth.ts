import crypto from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type UserRow } from "@workspace/db";
import { HttpError } from "./http";

export type Role = "admin" | "editor" | "reviewer";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env["SESSION_SECRET"];
  if (!value) throw new Error("SESSION_SECRET must be set to sign admin tokens");
  return value;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: UserRow;
    }
  }
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Phát hành token ký HMAC cho tài khoản quản trị */
export function issueToken(userId: number): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + TOKEN_TTL_MS })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): number | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { uid?: unknown; exp?: unknown };
    if (typeof data.uid !== "number" || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data.uid;
  } catch {
    return null;
  }
}

async function resolveActor(token: string | undefined): Promise<UserRow> {
  if (!token) throw new HttpError(401, "Vui lòng đăng nhập");
  const userId = verifyToken(token);
  if (!userId) throw new HttpError(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || !user.isActive) throw new HttpError(401, "Tài khoản không tồn tại hoặc đã bị khóa");
  return user;
}

function bearer(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
}

/** Yêu cầu token Bearer hợp lệ */
export const requireAuth: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  req.actor = await resolveActor(bearer(req));
  next();
};

/** Dùng cho đường dẫn tải tệp mở trong tab mới: chấp nhận token qua ?token= */
export const requireAuthFromQuery: RequestHandler = async (req, _res, next) => {
  const fromQuery = typeof req.query["token"] === "string" ? req.query["token"] : undefined;
  req.actor = await resolveActor(bearer(req) ?? fromQuery);
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    const actor = req.actor;
    if (!actor) throw new HttpError(401, "Vui lòng đăng nhập");
    if (!roles.includes(actor.role as Role)) {
      throw new HttpError(403, "Vai trò của bạn không được phép thực hiện thao tác này");
    }
    next();
  };
}

export function getActor(req: Request): UserRow {
  if (!req.actor) throw new HttpError(401, "Vui lòng đăng nhập");
  return req.actor;
}
