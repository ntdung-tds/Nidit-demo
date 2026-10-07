import { db, activityLogsTable, type UserRow } from "@workspace/db";
import { logger } from "./logger";

type ActorLike = Pick<UserRow, "id" | "fullName" | "role"> | null;

export interface ActivityEntry {
  action: string;
  actionLabel: string;
  entityType: string;
  entityId?: number | null;
  entityTitle?: string | null;
  detail?: string | null;
}

/** Ghi nhật ký thao tác; lỗi ghi nhật ký không làm hỏng thao tác chính */
export async function logActivity(actor: ActorLike, entry: ActivityEntry): Promise<void> {
  try {
    await db.insert(activityLogsTable).values({
      actorId: actor?.id ?? null,
      actorName: actor?.fullName ?? "Hệ thống",
      actorRole: actor?.role ?? null,
      action: entry.action,
      actionLabel: entry.actionLabel,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      entityTitle: entry.entityTitle ?? null,
      detail: entry.detail ?? null,
    });
  } catch (err) {
    logger.warn({ err, action: entry.action }, "Không ghi được nhật ký thao tác");
  }
}
