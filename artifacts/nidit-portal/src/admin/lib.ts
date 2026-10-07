import { ApiError } from '@workspace/api-client-react';
import type { UserRole, ArticleStatus, TransitionAction } from '@workspace/api-client-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Quản trị',
  editor: 'Biên tập',
  reviewer: 'Duyệt nội dung',
};

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  changes_requested: 'Yêu cầu sửa',
  approved: 'Đã duyệt',
  scheduled: 'Hẹn giờ đăng',
  published: 'Đã xuất bản',
  unpublished: 'Đã gỡ',
};
export const STATUS_ORDER: ArticleStatus[] = ['draft', 'pending', 'changes_requested', 'approved', 'scheduled', 'published', 'unpublished'];

export const ACTION_LABEL: Record<TransitionAction, string> = {
  submit: 'Gửi duyệt',
  request_changes: 'Yêu cầu chỉnh sửa',
  approve: 'Phê duyệt',
  publish: 'Xuất bản',
  unpublish: 'Gỡ bài',
  revert_to_draft: 'Chuyển về nháp',
};

export const HISTORY_LABEL: Record<string, string> = {
  create: 'Tạo bài',
  update: 'Cập nhật nội dung',
  submit: 'Gửi duyệt',
  request_changes: 'Yêu cầu chỉnh sửa',
  approve: 'Phê duyệt',
  publish: 'Xuất bản',
  schedule: 'Hẹn giờ đăng',
  unpublish: 'Gỡ bài',
  revert_to_draft: 'Chuyển về nháp',
  auto_publish: 'Tự động xuất bản',
  auto_unpublish: 'Tự động gỡ bài',
  import: 'Nhập từ tin tự động',
};

export type Section =
  | 'dashboard' | 'bai-viet' | 'trang-tinh' | 'tin-tu-dong' | 'van-ban' | 'du-lieu' | 'de-tai' | 'cong-bo'
  | 'thu-vien' | 'media' | 'yeu-cau' | 'thong-ke' | 'chuyen-muc' | 'menu' | 'nhat-ky' | 'nguoi-dung' | 'sao-luu' | 'cau-hinh';

const EDITOR: Section[] = ['dashboard', 'bai-viet', 'trang-tinh', 'tin-tu-dong', 'van-ban', 'du-lieu', 'de-tai', 'cong-bo', 'thu-vien', 'media', 'yeu-cau', 'thong-ke'];
const REVIEWER: Section[] = ['dashboard', 'bai-viet', 'yeu-cau', 'thong-ke'];

export function canAccess(role: UserRole | undefined, s: Section): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  return (role === 'editor' ? EDITOR : REVIEWER).includes(s);
}

export function errMsg(e: unknown): string {
  if (e instanceof ApiError) {
    const d = e.data as unknown;
    if (d && typeof d === 'object' && 'error' in d) return String((d as { error: unknown }).error);
    return e.message || `Lỗi ${e.status}`;
  }
  if (e instanceof Error) return e.message;
  return 'Đã có lỗi xảy ra';
}

const TZ = 'Asia/Ho_Chi_Minh';
const dtf = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
const df = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const parts = Object.fromEntries(dtf.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : df.format(d);
}
/** YYYY-MM-DD or YYYY-MM -> dd/MM/yyyy or MM/yyyy */
export function fmtCalDate(s: string | null | undefined): string {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  if (!m) return y;
  return d ? `${d}/${m}/${y}` : `${m}/${y}`;
}
export function fromNow(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : formatDistanceToNow(d, { addSuffix: true, locale: vi });
}
export function fmtNum(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString('vi-VN');
}
export function fmtBytes(n: number | null | undefined): string {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

/** ISO -> value for <input type="datetime-local"> (browser local time) */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export const nn = (s: string): string | null => (s.trim() ? s.trim() : null);

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[parts.length - 2]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const BASE = import.meta.env.BASE_URL;
