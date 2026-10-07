import { useEffect, type ReactNode } from 'react';
import { Switch, Route, Redirect, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, useGetCurrentUser, getGetCurrentUserQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { clearAdminToken, getAdminToken } from '@/lib/admin-token';
import './admin.css';
import { AuthCtx, useMe } from './auth';
import { Shell } from './Shell';
import { Forbidden, ErrorBox, Empty } from './ui';
import { canAccess, type Section } from './lib';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ArticlesPage from './pages/Articles';
import ArticleEditorPage from './pages/ArticleEditor';
import CategoriesPage from './pages/Categories';
import MenusPage from './pages/Menus';
import { PagesList, PageEditor } from './pages/StaticPages';
import CrawlerPage from './pages/Crawler';
import DocumentsPage from './pages/Documents';
import DatasetsPage from './pages/Datasets';
import ProjectsPage from './pages/Projects';
import PublicationsPage from './pages/Publications';
import AlbumsPage from './pages/Albums';
import MediaPage from './pages/Media';
import InquiriesPage from './pages/Inquiries';
import StatsPage from './pages/Stats';
import LogsPage from './pages/Logs';
import UsersPage from './pages/Users';
import BackupsPage from './pages/Backups';
import SettingsPage from './pages/Settings';

function useAdminChrome() {
  useEffect(() => {
    document.documentElement.classList.add('adm-theme');
    const id = 'adm-fonts';
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id;
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap';
      document.head.appendChild(l);
    }
    return () => document.documentElement.classList.remove('adm-theme');
  }, []);
}

function useUnauthorizedRedirect() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  useEffect(() => {
    const handle = (err: unknown) => {
      if (err instanceof ApiError && err.status === 401 && getAdminToken()) {
        clearAdminToken();
        qc.clear();
        navigate('/quan-tri/dang-nhap');
      }
    };
    const u1 = qc.getQueryCache().subscribe((e) => { if (e.type === 'updated') handle(e.query.state.error); });
    const u2 = qc.getMutationCache().subscribe((e) => { if (e.type === 'updated') handle(e.mutation?.state.error); });
    return () => { u1(); u2(); };
  }, [qc, navigate]);
}

function Guard({ children }: { children: ReactNode }) {
  const token = getAdminToken();
  const { data: me, isLoading, error, refetch } = useGetCurrentUser({ query: { enabled: !!token, queryKey: getGetCurrentUserQueryKey(), retry: false } });
  if (!token) return <Redirect to="/quan-tri/dang-nhap" />;
  if (error instanceof ApiError && error.status === 401) return <Redirect to="/quan-tri/dang-nhap" />;
  if (isLoading) {
    return (
      <div className="adm-root flex min-h-[100dvh] min-w-0 overflow-x-hidden bg-background">
        <div className="hidden w-[232px] shrink-0 bg-sidebar md:block" />
        <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <Skeleton className="h-8 w-full max-w-64" /><Skeleton className="h-4 w-full max-w-96" />
          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          <Skeleton className="h-56 sm:h-72" />
        </div>
      </div>
    );
  }
  if (error || !me) return <div className="adm-root mx-auto max-w-xl p-4 sm:p-8"><ErrorBox error={error} onRetry={() => refetch()} /></div>;
  return <AuthCtx.Provider value={me}><Shell>{children}</Shell></AuthCtx.Provider>;
}

function Gate({ s, children }: { s: Section; children: ReactNode }) {
  const me = useMe();
  return canAccess(me.role, s) ? <div className="adm-rise">{children}</div> : <Forbidden />;
}

function NotFound() {
  const [, navigate] = useLocation();
  return (
    <Empty title="Không tìm thấy trang quản trị" desc="Đường dẫn không tồn tại hoặc đã được thay đổi."
      action={<Button onClick={() => navigate('/quan-tri/dashboard')} data-testid="button-go-dashboard">Về trang tổng quan</Button>} />
  );
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/quan-tri/dashboard"><Gate s="dashboard"><DashboardPage /></Gate></Route>
      <Route path="/quan-tri/bai-viet"><Gate s="bai-viet"><ArticlesPage /></Gate></Route>
      <Route path="/quan-tri/bai-viet/moi"><Gate s="bai-viet"><ArticleEditorPage /></Gate></Route>
      <Route path="/quan-tri/bai-viet/:id">{(p) => <Gate s="bai-viet"><ArticleEditorPage id={Number(p.id)} /></Gate>}</Route>
      <Route path="/quan-tri/chuyen-muc"><Gate s="chuyen-muc"><CategoriesPage /></Gate></Route>
      <Route path="/quan-tri/menu"><Gate s="menu"><MenusPage /></Gate></Route>
      <Route path="/quan-tri/trang-tinh"><Gate s="trang-tinh"><PagesList /></Gate></Route>
      <Route path="/quan-tri/trang-tinh/moi"><Gate s="trang-tinh"><PageEditor /></Gate></Route>
      <Route path="/quan-tri/trang-tinh/:id">{(p) => <Gate s="trang-tinh"><PageEditor id={Number(p.id)} /></Gate>}</Route>
      <Route path="/quan-tri/tin-tu-dong"><Gate s="tin-tu-dong"><CrawlerPage /></Gate></Route>
      <Route path="/quan-tri/van-ban"><Gate s="van-ban"><DocumentsPage /></Gate></Route>
      <Route path="/quan-tri/du-lieu"><Gate s="du-lieu"><DatasetsPage /></Gate></Route>
      <Route path="/quan-tri/de-tai"><Gate s="de-tai"><ProjectsPage /></Gate></Route>
      <Route path="/quan-tri/cong-bo"><Gate s="cong-bo"><PublicationsPage /></Gate></Route>
      <Route path="/quan-tri/thu-vien"><Gate s="thu-vien"><AlbumsPage /></Gate></Route>
      <Route path="/quan-tri/media"><Gate s="media"><MediaPage /></Gate></Route>
      <Route path="/quan-tri/yeu-cau"><Gate s="yeu-cau"><InquiriesPage /></Gate></Route>
      <Route path="/quan-tri/thong-ke"><Gate s="thong-ke"><StatsPage /></Gate></Route>
      <Route path="/quan-tri/nhat-ky"><Gate s="nhat-ky"><LogsPage /></Gate></Route>
      <Route path="/quan-tri/nguoi-dung"><Gate s="nguoi-dung"><UsersPage /></Gate></Route>
      <Route path="/quan-tri/sao-luu"><Gate s="sao-luu"><BackupsPage /></Gate></Route>
      <Route path="/quan-tri/cau-hinh"><Gate s="cau-hinh"><SettingsPage /></Gate></Route>
      <Route><NotFound /></Route>
    </Switch>
  );
}

export default function AdminApp() {
  useAdminChrome();
  useUnauthorizedRedirect();
  return (
    <Switch>
      <Route path="/quan-tri/dang-nhap"><LoginPage /></Route>
      <Route path="/quan-tri"><Redirect to="/quan-tri/dashboard" /></Route>
      <Route><Guard><AdminRoutes /></Guard></Route>
    </Switch>
  );
}
