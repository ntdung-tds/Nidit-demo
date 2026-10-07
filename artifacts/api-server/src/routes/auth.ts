import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { GetCurrentUserResponse, ListDemoAccountsResponse, LoginBody, LoginResponse } from "@workspace/api-zod";
import { getActor, issueToken, requireAuth } from "../lib/auth";
import { HttpError, parseInput } from "../lib/http";
import { logActivity } from "../lib/activity";
import { toUser } from "../lib/serializers";

const router: IRouter = Router();

/** Bản trình diễn: chọn tài khoản mẫu thay cho đăng nhập mật khẩu */
router.get("/auth/demo-accounts", async (_req, res) => {
  const users = await db.select().from(usersTable).where(eq(usersTable.isActive, true)).orderBy(asc(usersTable.id));
  res.json(ListDemoAccountsResponse.parse(users.map(toUser)));
});

router.post("/auth/login", async (req, res) => {
  const body = parseInput(LoginBody, req.body);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, body.userId)).limit(1);
  if (!user || !user.isActive) throw new HttpError(400, "Tài khoản không tồn tại hoặc đã bị khóa");
  const [updated] = await db
    .update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(usersTable.id, user.id))
    .returning();
  await logActivity(user, {
    action: "login",
    actionLabel: "Đăng nhập hệ thống quản trị",
    entityType: "auth",
    entityId: user.id,
    entityTitle: user.fullName,
  });
  res.json(LoginResponse.parse({ token: issueToken(user.id), user: toUser(updated ?? user) }));
});

router.get("/auth/me", requireAuth, async (req, res) => {
  res.json(GetCurrentUserResponse.parse(toUser(getActor(req))));
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const actor = getActor(req);
  await logActivity(actor, {
    action: "logout",
    actionLabel: "Đăng xuất",
    entityType: "auth",
    entityId: actor.id,
    entityTitle: actor.fullName,
  });
  res.status(204).end();
});

export default router;
