import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { format } from 'date-fns';
import { vi as viLocale, enGB } from 'date-fns/locale';
import { ChevronDown, Home, Info, Mail, MapPin, Menu, Phone, Rss, Search, Clock, X, ExternalLink, Network, Users } from 'lucide-react';
import { useGetSiteSettings, useGetVisitCounter, useListMenuItems, getListMenuItemsQueryKey, getGetVisitCounterQueryKey } from '@workspace/api-client-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { clearAdminToken, getAdminToken } from '@/lib/admin-token';
import { cn } from '@/lib/utils';
import { asset, buildMenuTree, fmtNum, isArticlePath, usePortal, useTracker, type MenuNode } from './lib';
import { SmartLink } from './ui';
import { ExternalNewsDemo } from './ExternalNewsDemo';

const CRM_DEMO_SESSION = 'nidit_crm_demo_session_v1';
const READABLE_SOURCE_LINKS: Record<string, string> = {
  'https://mst.gov.vn/rss/tin-tuc-su-kien/chuyen-doi-so.rss': 'https://mst.gov.vn/so-lieu-thong-ke/chuyen-doi-so.htm',
  'https://congbao.chinhphu.vn/cac-van-ban-moi-ban-hanh.rss': 'https://congbao.chinhphu.vn/van-ban-dang-cong-bao.htm',
};

function useReadableSourceLinks() {
  const [loc] = useLocation();
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
        const raw = anchor.getAttribute('href');
        const readable = raw ? READABLE_SOURCE_LINKS[raw] : undefined;
        if (!readable) return;
        anchor.dataset.rssFeed = raw!;
        anchor.href = readable;
        anchor.title = 'Mở trang nguồn';
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [loc]);
}

function useMenu(location: 'main' | 'footer' | 'links') {
  const params = { location } as const;
  const q = useListMenuItems(params, { query: { queryKey: getListMenuItemsQueryKey(params), staleTime: 300_000 } });
  return { ...q, tree: buildMenuTree(q.data) };
}

export function useMenuLabel() {
  const { lang } = usePortal();
  return (m: { label: string; labelEn: string | null }) => (lang === 'en' && m.labelEn ? m.labelEn : m.label);
}

function isActive(loc: string, url: string) {
  if (url === '/') return loc === '/';
  return loc === url || loc.startsWith(url + '/');
}

/* ---------------- Demo notice ---------------- */
function DemoNotice() {
  const { data } = useGetSiteSettings();
  const { t } = usePortal();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem('nidit_demo_notice_hidden_v2') === '1');
  const notice = import.meta.env.VITE_GITHUB_PAGES === 'true'
    ? t('Giao diện và nội dung minh họa phục vụ giới thiệu, góp ý; chưa phải trang thông tin điện tử chính thức.', 'Illustrative design and content for presentation and feedback; this is not the official website.')
    : data?.demoNotice;
  if (!notice || hidden) return null;
  return (
    <div className="no-print border-b border-navy/10 bg-secondary/70 text-navy" role="note">
      <div className="container-portal flex items-start gap-2.5 py-2 text-[0.68rem] leading-relaxed sm:items-center sm:text-xs">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" aria-hidden />
        <p className="min-w-0 flex-1" data-testid="text-demo-notice">
          <strong className="mr-2 font-bold uppercase tracking-wide">{t('Bản demo', 'Demo')}</strong>{notice}
        </p>
        <button onClick={() => { sessionStorage.setItem('nidit_demo_notice_hidden_v2', '1'); setHidden(true); }} aria-label={t('Ẩn thông báo', 'Dismiss')} className="-my-1 -mr-1 grid h-7 w-7 shrink-0 place-items-center hover:bg-navy/5" data-testid="button-dismiss-demo">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */
function TopBar() {
  const { lang, setLang, t, fontLevel, setFontLevel } = usePortal();
  const { data: s } = useGetSiteSettings();
  const today = format(new Date(), lang === 'en' ? 'EEEE, d MMMM yyyy' : "EEEE, 'ngày' dd/MM/yyyy", { locale: lang === 'en' ? enGB : viLocale });
  const fbtn = 'grid h-6 min-w-6 place-items-center px-1 text-[11px] font-semibold hover:bg-white/10';
  return (
    <div className="bg-navy-deep text-[0.72rem] text-white/80">
      <div className="container-portal flex h-8 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="capitalize" data-testid="text-today">{today}</span>
          <span className="hidden h-3 w-px bg-white/25 md:block" />
          {s && (
            <a href={s.parentPortalUrl} target="_blank" rel="noopener noreferrer" className="hidden truncate hover:text-white md:block">
              {lang === 'en' ? s.parentOrgEn : s.parentOrg}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center sm:flex" role="group" aria-label={t('Cỡ chữ', 'Text size')}>
            <button className={fbtn} onClick={() => setFontLevel(fontLevel - 1)} aria-label={t('Giảm cỡ chữ', 'Decrease text size')} data-testid="button-font-decrease">A−</button>
            <button className={cn(fbtn, fontLevel === 1 && 'bg-white/10')} onClick={() => setFontLevel(1)} aria-label={t('Cỡ chữ mặc định', 'Reset text size')} data-testid="button-font-reset">A</button>
            <button className={fbtn} onClick={() => setFontLevel(fontLevel + 1)} aria-label={t('Tăng cỡ chữ', 'Increase text size')} data-testid="button-font-increase">A+</button>
          </div>
          <span className="hidden h-3 w-px bg-white/25 sm:block" />
          <div className="flex items-center gap-0.5" role="group" aria-label={t('Ngôn ngữ', 'Language')}>
            {(['vi', 'en'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={cn('px-1.5 py-0.5 text-[11px] font-semibold uppercase', lang === l ? 'bg-seal text-white' : 'hover:text-white')} data-testid={`button-lang-${l}`}>
                {l === 'vi' ? 'VI' : 'EN'}
              </button>
            ))}
          </div>
          <Link href="/rss" className="hidden items-center gap-1 hover:text-white md:flex" data-testid="link-rss-top"><Rss className="h-3 w-3" />RSS</Link>
          <Link href="/quan-tri" className="hidden items-center gap-1 border-l border-white/20 pl-3 font-semibold text-white/80 hover:text-white md:flex" data-testid="link-admin-top"><Users className="h-3 w-3" />{t('Quản trị / CRM', 'Admin / CRM')}</Link>
        </div>
      </div>
    </div>
  );
}

function SearchBox({ className, onDone }: { className?: string; onDone?: () => void }) {
  const [, navigate] = useLocation();
  const { t } = usePortal();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
    setQ('');
    onDone?.();
  };
  return (
    <form role="search" onSubmit={submit} className={cn('flex items-stretch border border-rule bg-card focus-within:border-navy', className)}>
      <label htmlFor="site-search" className="sr-only">{t('Tìm kiếm', 'Search')}</label>
      <input id="site-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Tìm tin tức, văn bản, dữ liệu…', 'Search news, documents, data…')} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/80" data-testid="input-search" />
      <button type="submit" className="grid w-10 place-items-center bg-navy text-primary-foreground hover:bg-navy-deep" aria-label={t('Tìm kiếm', 'Search')} data-testid="button-search"><Search className="h-4 w-4" /></button>
    </form>
  );
}

function Masthead() {
  const { data: s } = useGetSiteSettings();
  const { lang, t } = usePortal();
  const name = s?.siteName ?? 'Viện Công nghệ số và Chuyển đổi số quốc gia';
  const nameEn = s?.siteNameEn ?? 'National Institute of Digital Technology and Digital Transformation';
  return (
    <div className="paper-grain border-b border-rule bg-paper" data-testid="site-masthead">
      <div className="container-portal flex items-center justify-between gap-6 py-4 md:py-5">
        <Link href="/" className="flex min-w-0 items-center gap-3 md:gap-4" data-testid="link-home-logo">
          <img src={asset('logo-nidit.svg')} alt={t('Logo NIDIT (tạm thời)', 'NIDIT logo (temporary)')} className="h-12 w-12 shrink-0 md:h-[4.25rem] md:w-[4.25rem]" />
          <div className="min-w-0">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-seal md:text-[0.7rem]">
              {lang === 'en' ? (s?.parentOrgEn ?? 'Ministry of Science and Technology') : (s?.parentOrg ?? 'Bộ Khoa học và Công nghệ')}
            </div>
            <div className="font-display text-[1rem] font-bold uppercase leading-tight text-navy sm:text-[1.2rem] md:text-[1.55rem] lg:whitespace-nowrap" data-testid="text-site-name">
              {lang === 'en' ? nameEn : name}
            </div>
            <div className="mt-0.5 hidden truncate text-[0.72rem] uppercase tracking-[0.06em] text-muted-foreground sm:block md:text-[0.78rem]">
              {lang === 'en' ? name : nameEn}
            </div>
          </div>
        </Link>
        <SearchBox className="hidden w-[320px] shrink-0 lg:flex" />
      </div>
    </div>
  );
}

function DesktopNav({ tree }: { tree: MenuNode[] }) {
  const [loc] = useLocation();
  const label = useMenuLabel();
  const { t } = usePortal();
  return (
    <ul className="hidden h-11 items-stretch xl:flex">
      <li className="flex">
        <Link href="/" className={cn('grid w-11 place-items-center hover:bg-white/10', loc === '/' && 'bg-seal')} aria-label={t('Trang chủ', 'Home')} data-testid="link-nav-home"><Home className="h-4 w-4" /></Link>
      </li>
      {tree.filter((n) => n.url !== '/').map((n) => (
        <li key={n.id} className="group relative flex">
          <SmartLink href={n.url} newTab={n.openInNewTab} testId={`link-nav-${n.id}`}
            className={cn('flex items-center gap-1 px-3 text-[0.8rem] font-semibold uppercase tracking-[0.03em] hover:bg-white/10 xl:px-3.5', isActive(loc, n.url) && 'bg-white/10 shadow-[inset_0_-3px_0_hsl(var(--seal))]')}>
            {label(n)}
            {n.children.length > 0 && <ChevronDown className="h-3 w-3 opacity-70 transition-transform group-hover:rotate-180" />}
          </SmartLink>
          {n.children.length > 0 && (
            <ul className="invisible absolute left-0 top-full z-50 min-w-[250px] border-t-2 border-seal bg-card py-1.5 text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {n.children.map((c) => (
                <li key={c.id}>
                  <SmartLink href={c.url} newTab={c.openInNewTab} testId={`link-nav-${c.id}`} className={cn('block px-4 py-2 text-sm hover:bg-secondary hover:text-navy', isActive(loc, c.url) && 'font-semibold text-navy')}>
                    {label(c)}
                  </SmartLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function MobileNav({ tree }: { tree: MenuNode[] }) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const label = useMenuLabel();
  const { t, lang, setLang } = usePortal();
  const [adminSession, setAdminSession] = useState(() => import.meta.env.VITE_GITHUB_PAGES === 'true' ? sessionStorage.getItem(CRM_DEMO_SESSION) === '1' : !!getAdminToken());
  const close = () => setOpen(false);
  const logoutAdmin = () => {
    sessionStorage.removeItem(CRM_DEMO_SESSION);
    clearAdminToken();
    setAdminSession(false);
    close();
    navigate('/');
  };
  return (
    <Sheet open={open} onOpenChange={(next) => {
      setOpen(next);
      if (next) setAdminSession(import.meta.env.VITE_GITHUB_PAGES === 'true' ? sessionStorage.getItem(CRM_DEMO_SESSION) === '1' : !!getAdminToken());
    }}>
      <SheetTrigger asChild>
        <button className="grid h-11 w-11 place-items-center hover:bg-white/10 xl:hidden" aria-label={t('Mở menu', 'Open menu')} data-testid="button-mobile-menu"><Menu className="h-5 w-5" /></button>
      </SheetTrigger>
      <SheetContent side="left" className="flex h-[100dvh] max-h-[100dvh] w-[88vw] max-w-sm flex-col overflow-hidden bg-paper p-0">
        <SheetHeader className="shrink-0 border-b border-rule bg-navy p-4 text-left">
          <SheetTitle className="font-display text-base text-white">NIDIT</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          <div className="p-4"><SearchBox onDone={close} /></div>
          <nav aria-label={t('Menu chính', 'Main menu')}>
            <ul className="border-t border-rule">
              <li><Link href="/" onClick={close} className="block border-b border-rule px-4 py-3 text-sm font-semibold">{t('Trang chủ', 'Home')}</Link></li>
              {tree.filter((n) => n.url !== '/').map((n) => (
                <li key={n.id} className="border-b border-rule">
                  <SmartLink href={n.url} newTab={n.openInNewTab} onClick={close} className="block px-4 py-3 text-sm font-semibold">{label(n)}</SmartLink>
                  {n.children.length > 0 && (
                    <ul className="pb-2">
                      {n.children.map((c) => (
                        <li key={c.id}><SmartLink href={c.url} newTab={c.openInNewTab} onClick={close} className="block py-1.5 pl-8 pr-4 text-sm text-muted-foreground hover:text-navy">{label(c)}</SmartLink></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-2 p-4">
            {(['vi', 'en'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn('border px-3 py-1 text-xs font-semibold', lang === l ? 'border-navy bg-navy text-white' : 'border-rule')}>{l === 'vi' ? 'Tiếng Việt' : 'English'}</button>
            ))}
          </div>
          <div className="border-t border-rule p-4">
            {adminSession ? (
              <div className="space-y-2">
                <Link href="/quan-tri" onClick={close} className="flex items-center justify-center gap-2 bg-navy px-3 py-2.5 text-sm font-semibold text-white"><Users className="h-4 w-4" />{t('Mở Quản trị / CRM', 'Open Admin / CRM')}</Link>
                <button onClick={logoutAdmin} className="flex w-full items-center justify-center gap-2 border border-rule px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:border-seal hover:text-seal"><X className="h-4 w-4" />{t('Đăng xuất quản trị', 'Sign out of admin')}</button>
              </div>
            ) : (
              <Link href="/quan-tri" onClick={close} className="flex items-center justify-center gap-2 bg-navy px-3 py-2.5 text-sm font-semibold text-white"><Users className="h-4 w-4" />{t('Đăng nhập / Quản trị CRM', 'Sign in / Admin CRM')}</Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Header() {
  const { tree } = useMenu('main');
  const { t } = usePortal();
  return (
    <header className="min-w-0 overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-card focus:px-3 focus:py-2">{t('Bỏ qua đến nội dung', 'Skip to content')}</a>
      <TopBar />
      <Masthead />
      <nav aria-label={t('Menu chính', 'Main menu')} className="sticky top-0 z-40 border-b-[3px] border-seal bg-navy text-white shadow-sm">
        <div className="container-portal flex items-center justify-between">
          <MobileNav tree={tree} />
          <DesktopNav tree={tree} />
          <Link href="/tim-kiem" className="grid h-11 w-11 place-items-center hover:bg-white/10 xl:hidden" aria-label={t('Tìm kiếm', 'Search')}><Search className="h-4 w-4" /></Link>
        </div>
      </nav>
    </header>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  const { data: s } = useGetSiteSettings();
  const { data: counter } = useGetVisitCounter({ query: { queryKey: getGetVisitCounterQueryKey(), refetchInterval: 60_000 } });
  const footer = useMenu('footer');
  const links = useMenu('links');
  const label = useMenuLabel();
  const { lang, t } = usePortal();
  const flatLinks = links.tree.flatMap((n) => [n, ...n.children]);

  return (
    <footer className="mt-16 bg-navy-deep text-white/80">
      {flatLinks.length > 0 && (
        <div className="border-b border-white/10 bg-navy">
          <div className="container-portal flex flex-col gap-3 py-4 md:flex-row md:items-center">
            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-white">{t('Liên kết website', 'Related websites')}</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem]">
              {flatLinks.map((l) => (
                <li key={l.id}><SmartLink href={l.url} newTab={l.openInNewTab} className="inline-flex items-center gap-1 hover:text-white" testId={`link-weblink-${l.id}`}>{label(l)}<ExternalLink className="h-3 w-3 opacity-50" /></SmartLink></li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="container-portal grid gap-10 py-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-start gap-3">
            <img src={asset('logo-nidit.svg')} alt="" aria-hidden className="h-12 w-12" />
            <div>
              <div className="font-display text-lg font-semibold uppercase leading-snug text-white">{lang === 'en' ? s?.siteNameEn : s?.siteName}</div>
              <div className="mt-0.5 text-xs uppercase tracking-wide text-white/55">{lang === 'en' ? s?.siteName : s?.siteNameEn}</div>
            </div>
          </div>
          <dl className="mt-5 space-y-1.5 text-sm">
            <div><dt className="inline text-white/55">{t('Cơ quan chủ quản', 'Governing body')}: </dt><dd className="inline">{s && <a href={s.parentPortalUrl} target="_blank" rel="noopener noreferrer" className="text-white underline-offset-2 hover:underline">{lang === 'en' ? s.parentOrgEn : s.parentOrg}</a>}</dd></div>
            <div><dt className="inline text-white/55">{t('Người chịu trách nhiệm', 'Responsible person')}: </dt><dd className="inline text-white" data-testid="text-responsible">{s?.responsiblePerson} – {s?.responsibleTitle}</dd></div>
          </dl>
        </div>
        <div className="space-y-2.5 text-sm md:col-span-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-white">{t('Liên hệ', 'Contact')}</h2>
          <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{lang === 'en' ? s?.addressEn : s?.address}</p>
          <p className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><a href={`tel:${s?.phone ?? ''}`} className="hover:text-white">{s?.phone}</a></p>
          <p className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><a href={`mailto:${s?.email ?? ''}`} className="hover:text-white">{s?.email}</a></p>
          <p className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{s?.workingHours}</p>
        </div>
        <div className="md:col-span-3">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-white">{t('Thống kê truy cập', 'Visitors')}</h2>
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 text-center" data-testid="visit-counter">
            {[
              [t('Đang online', 'Online'), counter?.online],
              [t('Hôm nay', 'Today'), counter?.today],
              [t('Tháng này', 'This month'), counter?.thisMonth],
              [t('Tổng truy cập', 'Total'), counter?.total],
            ].map(([k, v]) => (
              <div key={String(k)} className="bg-navy-deep px-2 py-2.5">
                <dd className="num text-base font-medium text-white">{v === undefined ? '—' : fmtNum(v as number)}</dd>
                <dt className="text-[0.65rem] uppercase tracking-wide text-white/50">{k}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-3 border border-dashed border-white/25 p-2.5" aria-label={t('Nhãn Tín nhiệm mạng – minh họa', 'Trust badge – illustrative')}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white/30 text-[0.55rem] font-bold leading-none text-white/60">EMC</div>
            <div className="text-[0.7rem] leading-tight">
              <div className="font-semibold text-white/80">{t('Tín nhiệm mạng', 'Network trust')}</div>
              <div className="text-gold">{t('Minh họa – chưa được cấp', 'Illustrative – not yet certified')}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-portal flex flex-col gap-3 py-4 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>{s?.copyrightNote}</p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {footer.tree.flatMap((n) => [n, ...n.children]).map((f) => (
              <li key={f.id}><SmartLink href={f.url} newTab={f.openInNewTab} className="hover:text-white">{label(f)}</SmartLink></li>
            ))}
            <li><Link href="/so-do-trang" className="inline-flex items-center gap-1 hover:text-white" data-testid="link-sitemap"><Network className="h-3 w-3" />{t('Sơ đồ trang', 'Sitemap')}</Link></li>
            <li><Link href="/rss" className="inline-flex items-center gap-1 hover:text-white" data-testid="link-rss"><Rss className="h-3 w-3" />RSS</Link></li>
            <li><Link href="/quan-tri" className="inline-flex items-center gap-1 hover:text-white" data-testid="link-admin"><Users className="h-3 w-3" />{t('Quản trị / CRM', 'Admin / CRM')}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Route tracker ---------------- */
function RouteTracker() {
  const [loc] = useLocation();
  const track = useTracker();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!isArticlePath(loc)) track(loc);
  }, [loc, track]);
  return null;
}

export function PortalLayout({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  useReadableSourceLinks();
  return (
    <div className="flex min-h-[100dvh] min-w-0 flex-col overflow-x-clip">
      <RouteTracker />
      <DemoNotice />
      <Header />
      <main id="main" className="min-w-0 flex-1 overflow-x-clip">
        {children}
        {loc === '/' && <ExternalNewsDemo />}
      </main>
      <Footer />
    </div>
  );
}