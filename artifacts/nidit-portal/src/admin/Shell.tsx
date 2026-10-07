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
    <div className="flex flex-col h-full">
      <div className="px-4 h-14 flex items-center gap-2.5 border-b border-sidebar-border shrink-0">
        <img src={`${BASE}logo-nidit.svg`} alt="" className="h-8 w-8 rounded bg-[hsl(40_30%_97%)] p-0.5" />
        <div className="leading-tight min-w-0">
          <div className="text-[15px] font-bold tracking-wide text-sidebar-accent-foreground">NIDIT</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">Bàn biên tập</div>
        </div>
        <button className="ml-auto md:hidden text-sidebar-foreground" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto adm-scroll py-3 px-2.5 space-y-4">
        {GROUPS.map((g) => {
          const items = g.items.filter((i) => canAccess(me.role, i.s));
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <div className="px-2 mb-1 text-[10px] uppercase tracking-[0.16em] font-semibold text-sidebar-foreground/45">{g.title}</div>
              {items.map((i) => {
                const active = current === i.s;
                return (
                  <Link key={i.s} href={`/quan-tri/${i.s}`} onClick={() => setMobileOpen(false)}
                    className={cn('relative flex items-center gap-2.5 h-8 px-2 rounded text-[13px] transition-colors',
                      active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60')}
                    data-testid={`link-nav-${i.s}`}>
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-sidebar-primary" />}
                    <i.icon className="h-[15px] w-[15px] shrink-0 opacity-80" />
                    <span className="truncate">{i.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <a href={BASE} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-sidebar-foreground/70 hover:text-sidebar-accent-foreground px-1 mb-2" data-testid="link-public-site">
          <ExternalLink className="h-3.5 w-3.5" />Xem trang công khai
        </a>
        <div className="flex items-center gap-2.5 rounded bg-sidebar-accent/70 p-2">
          <Avatar className="h-8 w-8"><AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[11px] font-bold">{initials(me.fullName)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[12.5px] font-medium text-sidebar-accent-foreground truncate" data-testid="text-current-user">{me.fullName}</div>
            <div className="text-[11px] text-sidebar-foreground/60" data-testid="text-current-role">{ROLE_LABEL[me.role]}</div>
          </div>
          <button onClick={doLogout} title="Đăng xuất" className="text-sidebar-foreground/70 hover:text-sidebar-primary p-1" data-testid="button-logout"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="adm-root adm-paper min-h-[100dvh] bg-background text-foreground">
      <aside className="hidden md:block fixed inset-y-0 left-0 w-[232px] bg-sidebar z-30">{nav}</aside>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-[260px] bg-sidebar adm-rise">{nav}</div>
          <button className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Đóng" />
        </div>
      )}
      <div className="md:pl-[232px] relative z-10">
        <header className="sticky top-0 z-20 h-12 flex items-center gap-3 px-4 md:px-6 bg-background/85 backdrop-blur border-b border-border">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu" data-testid="button-open-nav"><PanelLeft className="h-5 w-5" /></button>
          <div className="text-[12px] text-muted-foreground truncate">
            Viện Công nghệ số và Chuyển đổi số quốc gia <span className="mx-1.5 opacity-40">/</span>
            <span className="text-foreground font-medium">Quản trị nội dung</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[12px]">
            <span className="hidden sm:inline text-muted-foreground">Đang làm việc với vai trò</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 font-semibold">
              <span className={cn('h-1.5 w-1.5 rounded-full', me.role === 'admin' ? 'bg-sidebar-primary' : me.role === 'reviewer' ? 'bg-[hsl(158_60%_34%)]' : 'bg-primary')} />
              {ROLE_LABEL[me.role]}
            </span>
          </div>
        </header>
        <main className="px-4 md:px-6 py-6 max-w-[1440px]">{children}</main>
      </div>
    </div>
  );
}
