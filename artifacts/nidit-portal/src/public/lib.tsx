import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useGetSiteSettings, useTrackVisit, type MenuItem } from '@workspace/api-client-react';

export type Lang = 'vi' | 'en';

type PortalCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (vi: string, en: string) => string;
  fontLevel: number;
  setFontLevel: (n: number) => void;
};

const Ctx = createContext<PortalCtx | null>(null);
const FONT_STEPS = [87.5, 100, 112.5, 125];

export function PortalProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem('nidit_lang') === 'en' ? 'en' : 'vi',
  );
  const [fontLevel, setFontState] = useState<number>(() => {
    const v = Number(typeof localStorage !== 'undefined' ? localStorage.getItem('nidit_font') : 1);
    return Number.isFinite(v) && v >= 0 && v < FONT_STEPS.length ? v : 1;
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('nidit_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_STEPS[fontLevel]}%`;
    localStorage.setItem('nidit_font', String(fontLevel));
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontLevel]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setFontLevel = useCallback((n: number) => setFontState(Math.max(0, Math.min(FONT_STEPS.length - 1, n))), []);
  const t = useCallback((vi: string, en: string) => (lang === 'en' ? en : vi), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, fontLevel, setFontLevel }), [lang, setLang, t, fontLevel, setFontLevel]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error('PortalProvider missing');
  return c;
}

/* ---------------- formatting ---------------- */
const TZ = 'Asia/Ho_Chi_Minh';

export function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  if (/^\d{4}-\d{2}$/.test(iso)) {
    const [y, m] = iso.split('-');
    return `${m}/${y}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const time = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  return `${fmtDate(iso)} ${time}`;
}

export function fmtNum(n?: number | null): string {
  return new Intl.NumberFormat('vi-VN').format(n ?? 0);
}

export function fmtBytes(n?: number | null): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function stripHtml(html?: string | null): string {
  return (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ---------------- query string ---------------- */
export function useQS() {
  const search = useSearch();
  const [location, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const set = useCallback(
    (updates: Record<string, string | number | null | undefined>, resetPage = true) => {
      const next = new URLSearchParams(search);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined || v === '') next.delete(k);
        else next.set(k, String(v));
      }
      if (resetPage && !('page' in updates)) next.delete('page');
      const s = next.toString();
      navigate(s ? `${location}?${s}` : location);
    },
    [search, location, navigate],
  );
  return { params, set };
}

/* ---------------- SEO ---------------- */
export function useSeo(title?: string | null, description?: string | null) {
  const { data: settings } = useGetSiteSettings();
  const { lang } = usePortal();
  useEffect(() => {
    const site = settings ? (lang === 'en' ? settings.siteNameEn || settings.shortName : settings.shortName) : 'NIDIT';
    document.title = title ? `${title} | ${site}` : settings?.seoTitle || site;
    const desc = description || settings?.seoDescription || '';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (desc) meta.setAttribute('content', desc.slice(0, 300));
  }, [title, description, settings, lang]);
}

/* ---------------- tracking ---------------- */
export function useTracker() {
  const track = useTrackVisit();
  const mutate = track.mutate;
  return useCallback(
    (path: string, articleId?: number | null) => {
      if (import.meta.env.VITE_GITHUB_PAGES === 'true') return;
      try {
        mutate({ data: { path, articleId: articleId ?? null, referrer: document.referrer || null } });
      } catch {
        /* fire-and-forget */
      }
    },
    [mutate],
  );
}

export function isArticlePath(path: string) {
  return /^\/tin-tuc\/(?!chuyen-muc\/)[^/]+$/.test(path);
}

/* ---------------- menu tree ---------------- */
export type MenuNode = MenuItem & { children: MenuNode[] };

export function buildMenuTree(items: MenuItem[] | undefined): MenuNode[] {
  if (!items) return [];
  const visible = items.filter((i) => i.isVisible);
  const map = new Map<number, MenuNode>();
  visible.forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots: MenuNode[] = [];
  map.forEach((n) => {
    if (n.parentId != null && map.has(n.parentId)) map.get(n.parentId)!.children.push(n);
    else if (n.parentId == null) roots.push(n);
  });
  const sort = (arr: MenuNode[]) => {
    arr.sort((a, b) => a.sortOrder - b.sortOrder);
    arr.forEach((c) => sort(c.children));
  };
  sort(roots);
  return roots;
}

export function isExternal(url: string) {
  return /^(https?:)?\/\//.test(url) || url.startsWith('mailto:');
}

export const BASE = import.meta.env.BASE_URL;
export const asset = (p: string) => `${BASE}${p.replace(/^\//, '')}`;
export const apiUrl = (p: string) => `${BASE}api/${p.replace(/^\//, '')}`;

export const DOC_GROUP_LABEL: Record<string, [string, string]> = {
  legal: ['Văn bản pháp luật', 'Legal documents'],
  direction: ['Văn bản chỉ đạo, điều hành', 'Directives'],
  guidance: ['Hướng dẫn', 'Guidance'],
  report: ['Báo cáo', 'Reports'],
  standard: ['Tiêu chuẩn, quy chuẩn', 'Standards'],
  form: ['Biểu mẫu', 'Forms'],
};

export const PROJECT_STATUS_LABEL: Record<string, [string, string]> = {
  proposed: ['Đề xuất', 'Proposed'],
  ongoing: ['Đang thực hiện', 'Ongoing'],
  completed: ['Đã nghiệm thu', 'Completed'],
};

export const PUB_TYPE_LABEL: Record<string, [string, string]> = {
  journal: ['Bài báo tạp chí', 'Journal article'],
  conference: ['Hội nghị khoa học', 'Conference paper'],
  book: ['Sách, chuyên khảo', 'Book'],
  report: ['Báo cáo khoa học', 'Report'],
  patent: ['Sáng chế, giải pháp hữu ích', 'Patent'],
};

export const ACCESS_LABEL: Record<string, [string, string]> = {
  open: ['Mở', 'Open'],
  registered: ['Cần đăng ký', 'Registration'],
  restricted: ['Hạn chế', 'Restricted'],
};
