import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout } from '@workspace/api-client-react';
import {
  LayoutDashboard, Newspaper, FileStack, Rss, ScrollText, Database, FlaskConical, BookOpen, Images, FolderOpen,
  Inbox, BarChart3, FolderTree, Menu as MenuIcon, History, Users, HardDriveDownload, Settings, ExternalLink, LogOut, X, PanelLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { clearAdminToken } from '@/lib/admin-token';
import { cn } from '@/lib/utils';
import { useMe } from './auth';
import { BASE, ROLE_LABEL, canAccess, initials, type Section } from './lib';

type NavItem = { s: Section; label: string; icon: typeof Newspaper };
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Bàn làm việc', items: [
    { s: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { s: 'bai-viet', label: 'Bài viết', icon: Newspaper },
    { s: 'tin-tu-dong', label: 'Tin tự động', icon: Rss },
    { s: 'yeu-cau', label: 'Yêu cầu từ công chúng', icon: Inbox },
  ] },
  { title: 'Nội dung', items: [
    { s: 'trang-tinh', label: 'Trang tĩnh', icon: FileStack },
    { s: 'van-ban', label: 'Văn bản', icon: ScrollText },
    { s: 'du-lieu', label: 'Dữ liệu AI', icon: Database },
    { s: 'de-tai', label: 'Đề tài, dự án', icon: FlaskConical },
    { s: 'cong-bo', label: 'Công bố khoa học', icon: BookOpen },
    { s: 'thu-vien', label: 'Thư viện ảnh, video', icon: Images },
    { s: 'media', label: 'Thư viện media', icon: FolderOpen },
  ] },
  { title: 'Cấu trúc & báo cáo', items: [
    { s: 'chuyen-muc', label: 'Chuyên mục', icon: FolderTree },
    { s: 'menu', label: 'Menu', icon: MenuIcon },
    { s: 'thong-ke', label: 'Thống kê truy cập', icon: BarChart3 },
  ] },
  { title: 'Hệ thống', items: [
    { s: 'nguoi-dung', label: 'Người dùng & vai trò', icon: Users },
    { s: 'nhat-ky', label: 'Nhật ký hoạt động', icon: History },
    { s: 'sao-luu', label: 'Sao lưu dữ liệu', icon: HardDriveDownload },
    { s: 'cau-hinh', label: 'Cấu hình trang', icon: Settings },
  ] },
];

export function Shell({ children }: { children: ReactNode }) {
  const me = useMe();
  const [loc, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const qc = useQueryClient();
  const logout = useLogout();
  const doLogout = () => {
    const done = () => { clearAdminToken(); qc.clear(); navigate('/quan-tri/dang-nhap'); };
    logout.mutate(undefined, { onSettled: done });
  };
  const current = loc.split('/')[2] ?? 'dashboard';

  const nav = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={`${BASE}logo-nidit.svg`} alt="" className="h-8 w-8 rounded bg-[hsl(40_30%_97%)] p-0.5" />
        <div className="min-w-0 leading-tight">
          <div className="text-[15px] font-bold tracking-wide text-sidebar-accent-foreground">NIDIT</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">Bàn biên tập</div>
        </div>
        <button className="ml-auto grid h-9 w-9 place-items-center text-sidebar-foreground md:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="adm-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-2.5 py-3 touch-pan-y">
        {GROUPS.map((g) => {
          const items = g.items.filter((i) => canAccess(me.role, i.s));
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">{g.title}</div>
              {items.map((i) => {
                const active = current === i.s;
                return (
                  <Link key={i.s} href={`/quan-tri/${i.s}`} onClick={() => setMobileOpen(false)}
                    className={cn('relative flex min-h-10 items-center gap-2.5 rounded px-2 py-2 text-[13px] transition-colors md:min-h-8 md:py-1.5',
                      active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground')}
                    data-testid={`link-nav-${i.s}`}>
                    {active && <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r bg-sidebar-primary" />}
                    <i.icon className="h-[15px] w-[15px] shrink-0 opacity-80" />
                    <span className="truncate">{i.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a href={BASE} target="_blank" rel="noreferrer" className="mb-2 flex min-h-9 items-center gap-2 px-1 text-[12px] text-sidebar-foreground/70 hover:text-sidebar-accent-foreground" data-testid="link-public-site">
          <ExternalLink className="h-3.5 w-3.5" />Xem trang công khai
        </a>
        <div className="flex items-center gap-2.5 rounded bg-sidebar-accent/70 p-2">
          <Avatar className="h-8 w-8"><AvatarFallback className="bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">{initials(me.fullName)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[12.5px] font-medium text-sidebar-accent-foreground" data-testid="text-current-user">{me.fullName}</div>
            <div className="truncate text-[11px] text-sidebar-foreground/60" data-testid="text-current-role">{ROLE_LABEL[me.role]}</div>
          </div>
          <button onClick={doLogout} title="Đăng xuất" className="grid h-9 w-9 shrink-0 place-items-center text-sidebar-foreground/70 hover:text-sidebar-primary" data-testid="button-logout"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="adm-root adm-paper min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] bg-sidebar md:block">{nav}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="adm-rise h-[100dvh] w-[min(88vw,320px)] overflow-hidden bg-sidebar">{nav}</div>
          <button className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Đóng" />
        </div>
      )}
      <div className="relative z-10 min-w-0 md:pl-[232px]">
        <header className="sticky top-0 z-20 flex min-h-12 items-center gap-2 border-b border-border bg-background/90 px-3 py-2 backdrop-blur sm:gap-3 sm:px-4 md:px-6">
          <button className="grid h-9 w-9 shrink-0 place-items-center md:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu" data-testid="button-open-nav"><PanelLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground sm:text-[12px]">
            <span className="sm:hidden">NIDIT</span>
            <span className="hidden sm:inline">Viện Công nghệ số và Chuyển đổi số quốc gia</span>
            <span className="mx-1.5 opacity-40">/</span>
            <span className="font-medium text-foreground">Quản trị nội dung</span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2 text-[12px] sm:gap-3">
            <span className="hidden lg:inline text-muted-foreground">Đang làm việc với vai trò</span>
            <span className="inline-flex max-w-[120px] items-center gap-1.5 truncate rounded-full border border-border bg-card px-2 py-1 text-[10.5px] font-semibold sm:max-w-none sm:px-2.5 sm:py-0.5 sm:text-[12px]">
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', me.role === 'admin' ? 'bg-sidebar-primary' : me.role === 'reviewer' ? 'bg-[hsl(158_60%_34%)]' : 'bg-primary')} />
              <span className="truncate">{ROLE_LABEL[me.role]}</span>
            </span>
          </div>
        </header>
        <main className="min-w-0 max-w-[1440px] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
