import type { ArticleStatus, TransitionAction } from "@workspace/api-zod";
import type { Role } from "./auth";

/** Quy trình tin bài: biên tập → gửi duyệt → duyệt → xuất bản / hẹn giờ → gỡ */
export const TRANSITIONS: Record<TransitionAction, { from: ArticleStatus[]; roles: Role[]; label: string }> = {
  submit: { from: ["draft", "changes_requested"], roles: ["admin", "editor"], label: "Gửi duyệt" },
  request_changes: { from: ["pending", "approved"], roles: ["admin", "reviewer"], label: "Yêu cầu chỉnh sửa" },
  approve: { from: ["pending"], roles: ["admin", "reviewer"], label: "Duyệt nội dung" },
  publish: {
    from: ["pending", "approved", "scheduled", "unpublished"],
    roles: ["admin", "reviewer"],
    label: "Xuất bản",
  },
  unpublish: { from: ["published", "scheduled"], roles: ["admin", "reviewer"], label: "Gỡ bài" },
  revert_to_draft: {
    from: ["pending", "changes_requested", "unpublished"],
    roles: ["admin", "editor"],
    label: "Chuyển về bản nháp",
  },
};

/** Nhãn ghi nhật ký thao tác cho từng bước chuyển trạng thái */
export const ACTIVITY_LABEL: Record<TransitionAction, string> = {
  submit: "Gửi duyệt bài viết",
  request_changes: "Yêu cầu chỉnh sửa bài viết",
  approve: "Duyệt nội dung bài viết",
  publish: "Xuất bản bài viết",
  unpublish: "Gỡ bài viết",
  revert_to_draft: "Chuyển bài viết về bản nháp",
};

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  changes_requested: "Cần chỉnh sửa",
  approved: "Đã duyệt",
  scheduled: "Hẹn giờ xuất bản",
  published: "Đã xuất bản",
  unpublished: "Đã gỡ",
};

export function availableActions(role: string, status: string): TransitionAction[] {
  return (Object.keys(TRANSITIONS) as TransitionAction[]).filter((action) => {
    const rule = TRANSITIONS[action];
    return rule.roles.includes(role as Role) && rule.from.includes(status as ArticleStatus);
  });
}

/** Ai được sửa nội dung bài ở trạng thái nào */
export function canEditArticle(role: string, status: string): boolean {
  if (role === "admin") return true;
  if (role === "editor") return status === "draft" || status === "changes_requested";
  if (role === "reviewer") return status === "pending" || status === "approved";
  return false;
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status as ArticleStatus] ?? status;
}
