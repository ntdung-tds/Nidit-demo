import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Download, FileText, Images, Play, Rss, Search, X, ChevronLeft, ChevronRight, Copy, Check, Map as MapIcon } from 'lucide-react';
import {
  useListDocuments, getListDocumentsQueryKey, useGetDocument, getGetDocumentQueryKey, useRecordDocumentDownload,
  useListAlbums, getListAlbumsQueryKey, useGetAlbum, getGetAlbumQueryKey, useSearchSite, getSearchSiteQueryKey, useListMenuItems, getListMenuItemsQueryKey, useListCategories,
  ApiError, type DocumentItem, type DocumentGroup, type DocumentSort, type AlbumType, type SearchType,
} from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DOC_GROUP_LABEL, apiUrl, buildMenuTree, fmtBytes, fmtDate, fmtNum, useQS, usePortal, useSeo } from '../lib';
import { EmptyState, ErrorState, FacetButton, Img, ListSkeleton, PageHeader, PageSkeleton, Pagination, SectionHead, SideBox, SmartLink, Tag } from '../ui';
import NotFoundPage from './NotFound';

/* ================= Documents ================= */
function useDownload() {
  const dl = useRecordDocumentDownload();
  const [busy, setBusy] = useState<number | null>(null);
  const go = (d: DocumentItem) => {
    setBusy(d.id);
    const w = d.fileUrl ? null : window.open('', '_blank');
    if (d.fileUrl) window.open(d.fileUrl, '_blank', 'noopener');
    dl.mutate({ id: d.id }, {
      onSuccess: (r) => { if (w && r.fileUrl) w.location.href = r.fileUrl; else w?.close(); },
      onError: () => w?.close(),
      onSettled: () => setBusy(null),
    });
  };
  return { go, busy };
}

export function DocumentsPage() {
  const { lang, t } = usePortal();
  const title = t('Văn bản – Tài liệu', 'Documents');
  useSeo(title, null);
  const { params, set } = useQS();
  const page = Number(params.get('page') ?? 1) || 1;
  const docGroup = (params.get('docGroup') ?? undefined) as DocumentGroup | undefined;
  const docType = params.get('docType') ?? undefined;
  const issuer = params.get('issuer') ?? undefined;
  const year = params.get('year') ? Number(params.get('year')) : undefined;
  const sort = (params.get('sort') ?? 'newest') as DocumentSort;
  const qq = params.get('q') ?? undefined;
  const p = { page, pageSize: 15, docGroup, docType, issuer, year, sort, q: qq };
  const list = useListDocuments(p, { query: { queryKey: getListDocumentsQueryKey(p) } });
  const [term, setTerm] = useState(qq ?? '');
  const { go, busy } = useDownload();
  const f = list.data?.facets;
  const L = (k: string, fb: string) => DOC_GROUP_LABEL[k]?.[lang === 'en' ? 1 : 0] ?? fb;

  return (
    <>
      <PageHeader title={title} kicker={t('Cơ sở dữ liệu văn bản', 'Document database')} crumbs={[{ label: title }]} description={t('Văn bản quy phạm pháp luật, chỉ đạo điều hành, hướng dẫn, tiêu chuẩn và biểu mẫu liên quan đến hoạt động của Viện.', 'Legal documents, directives, guidance, standards and forms.')}>
        <form onSubmit={(e) => { e.preventDefault(); set({ q: term }); }} className="mt-6 flex max-w-3xl border border-rule bg-card focus-within:border-navy">
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('Số ký hiệu, trích yếu, cơ quan ban hành…', 'Number, title, issuer…')} className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none" data-testid="input-document-search" />
          <button className="flex items-center gap-2 bg-navy px-5 text-sm font-semibold text-white hover:bg-navy-deep" data-testid="button-document-search"><Search className="h-4 w-4" />{t('Tra cứu', 'Search')}</button>
        </form>
      </PageHeader>
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <SideBox title={t('Nhóm văn bản', 'Group')}>
            <FacetButton active={!docGroup} onClick={() => set({ docGroup: null })} label={t('Tất cả', 'All')} />
            {(f?.groups ?? []).map((g) => <FacetButton key={g.value} active={docGroup === g.value} onClick={() => set({ docGroup: g.value })} label={L(g.value, g.label)} count={g.count} testId={`button-group-${g.value}`} />)}
          </SideBox>
          <SideBox title={t('Loại văn bản', 'Type')}>
            <FacetButton active={!docType} onClick={() => set({ docType: null })} label={t('Tất cả', 'All')} />
            {(f?.docTypes ?? []).map((g) => <FacetButton key={g.value} active={docType === g.value} onClick={() => set({ docType: g.value })} label={g.label} count={g.count} />)}
          </SideBox>
          <SideBox title={t('Cơ quan ban hành', 'Issuer')}>
            <FacetButton active={!issuer} onClick={() => set({ issuer: null })} label={t('Tất cả', 'All')} />
            {(f?.issuers ?? []).map((g) => <FacetButton key={g.value} active={issuer === g.value} onClick={() => set({ issuer: g.value })} label={g.label} count={g.count} />)}
          </SideBox>
          <SideBox title={t('Năm ban hành', 'Year')}>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => set({ year: null })} className={cn('border px-2 py-1 text-xs', !year ? 'border-navy bg-navy text-white' : 'border-rule hover:border-navy')}>{t('Tất cả', 'All')}</button>
              {(f?.years ?? []).map((g) => <button key={g.value} onClick={() => set({ year: g.value })} className={cn('num border px-2 py-1 text-xs', String(year) === g.value ? 'border-navy bg-navy text-white' : 'border-rule hover:border-navy')}>{g.label} <span className="opacity-60">({g.count})</span></button>)}
            </div>
          </SideBox>
        </aside>
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="meta num">{fmtNum(list.data?.total)} {t('văn bản', 'documents')}</p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">{t('Sắp xếp', 'Sort')}
              <select value={sort} onChange={(e) => set({ sort: e.target.value })} className="border border-rule bg-card px-2 py-1.5 text-sm text-foreground" data-testid="select-document-sort">
                <option value="newest">{t('Mới ban hành', 'Newest')}</option>
                <option value="oldest">{t('Cũ nhất', 'Oldest')}</option>
                <option value="downloads">{t('Tải nhiều', 'Most downloaded')}</option>
              </select>
            </label>
          </div>
          {list.isLoading ? <ListSkeleton withImage={false} /> : list.isError ? <ErrorState onRetry={() => list.refetch()} /> : !list.data?.items.length ? (
            <EmptyState icon={FileText} title={t('Không tìm thấy văn bản', 'No documents found')} hint={t('Thử bỏ bớt bộ lọc.', 'Try fewer filters.')} />
          ) : (
            <>
              <div className="overflow-x-auto border border-rule bg-card">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-navy text-left text-xs uppercase tracking-wide text-white"><tr><th className="px-3 py-2.5">{t('Số ký hiệu', 'Number')}</th><th className="px-3 py-2.5">{t('Trích yếu', 'Title')}</th><th className="px-3 py-2.5 whitespace-nowrap">{t('Ban hành', 'Issued')}</th><th className="px-3 py-2.5" /></tr></thead>
                  <tbody className="divide-y divide-rule">
                    {list.data.items.map((d) => (
                      <tr key={d.id} className="align-top hover:bg-paper" data-testid={`row-document-${d.id}`}>
                        <td className="num whitespace-nowrap px-3 py-3 text-xs font-medium text-navy">{d.number}</td>
                        <td className="px-3 py-3"><Link href={`/van-ban/${d.id}`} className="headline-link font-medium text-ink">{d.title}</Link><div className="meta mt-1">{d.docType} · {d.issuer}</div></td>
                        <td className="num whitespace-nowrap px-3 py-3 text-xs">{fmtDate(d.issuedDate)}</td>
                        <td className="px-3 py-3 text-right">{d.fileUrl !== undefined && <button onClick={() => go(d)} disabled={busy === d.id} className="inline-flex items-center gap-1 border border-rule px-2 py-1 text-xs hover:border-navy hover:text-navy disabled:opacity-50" data-testid={`button-download-${d.id}`}><Download className="h-3 w-3" />{d.fileFormat ?? t('Tải', 'Get')}</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={list.data.totalPages} onPage={(n) => set({ page: n }, false)} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const num = Number(id);
  const { lang, t } = usePortal();
  const q = useGetDocument(num, { query: { enabled: Number.isFinite(num) && num > 0, queryKey: getGetDocumentQueryKey(num) } });
  const { go, busy } = useDownload();
  const d = q.data?.document;
  useSeo(d ? `${d.number} – ${d.title}` : null, d?.summary ?? null);
  if (!Number.isFinite(num) || num <= 0) return <NotFoundPage />;
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !d) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;
  const rows: [string, string | null][] = [
    [t('Số ký hiệu', 'Number'), d.number], [t('Loại văn bản', 'Type'), d.docType], [t('Nhóm', 'Group'), DOC_GROUP_LABEL[d.docGroup]?.[lang === 'en' ? 1 : 0] ?? d.docGroup],
    [t('Cơ quan ban hành', 'Issuer'), d.issuer], [t('Người ký', 'Signer'), d.signer], [t('Ngày ban hành', 'Issued'), fmtDate(d.issuedDate)],
    [t('Ngày hiệu lực', 'Effective'), d.effectiveDate ? fmtDate(d.effectiveDate) : null], [t('Lĩnh vực', 'Field'), d.fieldName],
  ];
  return (
    <>
      <PageHeader title={d.title} kicker={d.number} crumbs={[{ label: t('Văn bản', 'Documents'), href: '/van-ban' }, { label: d.number }]} />
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-8">
          <div className="border border-rule bg-card">
            <table className="w-full text-sm"><tbody className="divide-y divide-rule">
              {rows.filter(([, v]) => v).map(([k, v]) => <tr key={k}><th className="w-44 bg-paper px-4 py-2.5 text-left font-medium text-muted-foreground">{k}</th><td className="px-4 py-2.5 font-medium text-ink">{v}</td></tr>)}
            </tbody></table>
          </div>
          {d.summary && <section><SectionHead title={t('Trích yếu nội dung', 'Summary')} /><p className="leading-relaxed">{d.summary}</p></section>}
          {(q.data?.related ?? []).length > 0 && (
            <section><SectionHead title={t('Văn bản liên quan', 'Related')} />
              <ul className="divide-y divide-rule border-y border-rule">{q.data!.related.map((r) => <li key={r.id} className="py-2.5"><Link href={`/van-ban/${r.id}`} className="flex gap-3 text-sm hover:text-navy"><span className="num w-36 shrink-0 text-xs text-navy">{r.number}</span><span>{r.title}</span></Link></li>)}</ul>
            </section>
          )}
        </div>
        <aside className="space-y-6">
          <SideBox title={t('Tệp đính kèm', 'Attachment')}>
            {d.fileUrl || d.fileName ? (
              <>
                <div className="flex gap-3"><FileText className="h-8 w-8 shrink-0 text-seal" /><div className="min-w-0"><div className="truncate text-sm font-medium">{d.fileName ?? d.number}</div><div className="meta num">{d.fileFormat} {fmtBytes(d.fileSize)}</div></div></div>
                <button onClick={() => go(d)} disabled={busy === d.id} className="mt-3 flex w-full items-center justify-center gap-2 bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60" data-testid="button-document-download"><Download className="h-4 w-4" />{t('Tải văn bản', 'Download')}</button>
              </>
            ) : <p className="text-sm text-muted-foreground">{t('Chưa có tệp đính kèm.', 'No attachment.')}</p>}
            <p className="meta mt-2 num">{fmtNum(d.downloadCount)} {t('lượt tải', 'downloads')}</p>
          </SideBox>
        </aside>
      </div>
    </>
  );
}

/* ================= Library ================= */
export function LibraryPage() {
  const { t } = usePortal();
  const title = t('Thư viện ảnh – video', 'Media library');
  useSeo(title, null);
  const { params, set } = useQS();
  const type = (params.get('type') ?? undefined) as AlbumType | undefined;
  const p = { type };
  const q = useListAlbums(p, { query: { queryKey: getListAlbumsQueryKey(p) } });
  return (
    <>
      <PageHeader title={title} kicker={t('Tư liệu', 'Archive')} crumbs={[{ label: t('Thư viện', 'Library') }]}>
        <div className="mt-5 flex gap-1">
          {([[undefined, t('Tất cả', 'All')], ['photo', t('Ảnh', 'Photos')], ['video', 'Video']] as const).map(([v, l]) => (
            <button key={l} onClick={() => set({ type: v ?? null })} className={cn('border px-4 py-1.5 text-sm font-medium', type === v ? 'border-navy bg-navy text-white' : 'border-rule bg-card hover:border-navy')} data-testid={`button-album-type-${v ?? 'all'}`}>{l}</button>
          ))}
        </div>
      </PageHeader>
      <div className="container-portal py-8">
        {q.isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !q.data?.length ? <EmptyState icon={Images} title={t('Chưa có album', 'No albums yet')} /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.map((a) => (
              <Link key={a.id} href={`/thu-vien/${a.slug}`} className="group" data-testid={`card-album-${a.id}`}>
                <div className="relative">
                  <Img src={a.coverImage} alt={a.title} label={a.title} ratio="aspect-[4/3]" />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-ink/80 px-2 py-0.5 text-xs text-white">{a.type === 'video' ? <Play className="h-3 w-3" /> : <Images className="h-3 w-3" />}<span className="num">{a.itemCount}</span></span>
                </div>
                <h2 className="mt-2.5 font-display font-semibold leading-snug text-ink group-hover:text-navy">{a.title}</h2>
                <div className="meta num mt-1">{fmtDate(a.eventDate ?? a.createdAt)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function AlbumPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = usePortal();
  const q = useGetAlbum(slug, { query: { enabled: !!slug, queryKey: getGetAlbumQueryKey(slug) } });
  const [idx, setIdx] = useState<number | null>(null);
  const a = q.data;
  useSeo(a?.title ?? null, a?.description ?? null);
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !a) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;
  const cur = idx !== null ? a.items[idx] : null;
  const n = a.items.length;
  return (
    <>
      <PageHeader title={a.title} kicker={a.type === 'video' ? 'Video' : t('Album ảnh', 'Photo album')} description={a.description} crumbs={[{ label: t('Thư viện', 'Library'), href: '/thu-vien' }, { label: a.title }]} />
      <div className="container-portal py-8">
        {n === 0 ? <EmptyState icon={Images} title={t('Album chưa có nội dung', 'Album is empty')} /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {a.items.map((it, i) => (
              <button key={i} onClick={() => setIdx(i)} className="group relative text-left" data-testid={`button-media-${i}`}>
                <Img src={it.thumbnailUrl ?? (it.type === 'photo' ? it.url : null)} alt={it.caption ?? a.title} label={it.caption ?? undefined} ratio="aspect-[4/3]" />
                {it.type === 'video' && <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-ink/70 text-white"><Play className="h-5 w-5" /></span></span>}
                {it.caption && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{it.caption}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
      <Dialog open={idx !== null} onOpenChange={(o) => !o && setIdx(null)}>
        <DialogContent className="max-w-5xl rounded-none border-0 bg-ink p-0 text-white [&>button]:hidden">
          <DialogTitle className="sr-only">{cur?.caption ?? a.title}</DialogTitle>
          {cur && (
            <div>
              <div className="relative grid place-items-center bg-black/40">
                {cur.type === 'video' ? <video src={cur.url} controls autoPlay className="max-h-[75vh] w-full" /> : <img src={cur.url} alt={cur.caption ?? a.title} className="max-h-[75vh] w-auto object-contain" />}
                {n > 1 && <>
                  <button onClick={() => setIdx(((idx ?? 0) - 1 + n) % n)} className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-ink/70 hover:bg-ink" aria-label={t('Trước', 'Previous')}><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => setIdx(((idx ?? 0) + 1) % n)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-ink/70 hover:bg-ink" aria-label={t('Sau', 'Next')}><ChevronRight className="h-5 w-5" /></button>
                </>}
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{cur.caption}</span>
                <span className="flex items-center gap-3"><span className="num text-white/60">{(idx ?? 0) + 1}/{n}</span><button onClick={() => setIdx(null)} aria-label={t('Đóng', 'Close')} data-testid="button-lightbox-close"><X className="h-5 w-5" /></button></span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ================= Search ================= */
export function SearchPage() {
  const { t } = usePortal();
  const { params, set } = useQS();
  const qq = params.get('q') ?? '';
  const type = (params.get('type') ?? undefined) as SearchType | undefined;
  const [term, setTerm] = useState(qq);
  const p = { q: qq, type };
  const s = useSearchSite(p, { query: { enabled: qq.trim().length >= 2, queryKey: getSearchSiteQueryKey(p) } });
  useSeo(qq ? `${t('Tìm kiếm', 'Search')}: ${qq}` : t('Tìm kiếm', 'Search'), null);
  return (
    <>
      <PageHeader title={t('Tìm kiếm', 'Search')} crumbs={[{ label: t('Tìm kiếm', 'Search') }]}>
        <form onSubmit={(e) => { e.preventDefault(); set({ q: term.trim(), type: null }); }} className="mt-5 flex max-w-3xl border-2 border-navy bg-card">
          <input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('Nhập từ khóa: tin tức, văn bản, đề tài, dữ liệu…', 'Keywords: news, documents, projects, data…')} className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none" data-testid="input-site-search" />
          <button className="flex items-center gap-2 bg-navy px-5 font-semibold text-white" data-testid="button-site-search"><Search className="h-4 w-4" />{t('Tìm', 'Search')}</button>
        </form>
      </PageHeader>
      <div className="container-portal py-8">
        {qq.trim().length < 2 ? <EmptyState icon={Search} title={t('Nhập ít nhất 2 ký tự để tìm kiếm', 'Enter at least 2 characters')} /> : s.isLoading ? <ListSkeleton withImage={false} /> : s.isError ? <ErrorState onRetry={() => s.refetch()} /> : !s.data?.total ? (
          <EmptyState icon={Search} title={`${t('Không có kết quả cho', 'No results for')} “${qq}”`} hint={t('Kiểm tra chính tả hoặc dùng từ khóa ngắn hơn.', 'Check spelling or use shorter keywords.')} />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
            <aside><SideBox title={t('Loại nội dung', 'Type')}>
              <FacetButton active={!type} onClick={() => set({ type: null })} label={t('Tất cả', 'All')} count={type ? undefined : s.data.total} />
              {s.data.groups.map((g) => <FacetButton key={g.type} active={type === g.type} onClick={() => set({ type: g.type })} label={g.label} count={g.total} testId={`button-search-type-${g.type}`} />)}
            </SideBox></aside>
            <div className="space-y-8">
              <p className="meta num">{fmtNum(s.data.total)} {t('kết quả cho', 'results for')} “{s.data.query}”</p>
              {s.data.groups.filter((g) => g.items.length).map((g) => (
                <section key={g.type}>
                  <SectionHead title={`${g.label} (${g.total})`} />
                  <ul className="divide-y divide-rule">
                    {g.items.map((h) => (
                      <li key={`${h.type}-${h.id}`} className="py-3">
                        <SmartLink href={h.url} className="headline-link font-display text-[1.05rem] font-semibold text-ink">{h.title}</SmartLink>
                        {h.snippet && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{h.snippet}</p>}
                        <div className="meta mt-1 flex gap-3"><Tag tone="muted">{g.label}</Tag>{h.date && <span className="num">{fmtDate(h.date)}</span>}</div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ================= Sitemap ================= */
const MAIN_P = { location: 'main' } as const;
export function SitemapPage() {
  const { lang, t } = usePortal();
  const title = t('Sơ đồ trang', 'Sitemap');
  useSeo(title, null);
  const menu = useListMenuItems(MAIN_P, { query: { queryKey: getListMenuItemsQueryKey(MAIN_P) } });
  const cats = useListCategories();
  const tree = buildMenuTree(menu.data);
  const extra = [
    { href: '/tim-kiem', l: t('Tìm kiếm', 'Search') }, { href: '/rss', l: 'RSS' }, { href: '/lien-he', l: t('Liên hệ', 'Contact') },
  ];
  return (
    <>
      <PageHeader title={title} crumbs={[{ label: title }]} />
      <div className="container-portal py-8">
        {menu.isLoading ? <Skeleton className="h-60" /> : menu.isError ? <ErrorState onRetry={() => menu.refetch()} /> : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {tree.map((n) => (
              <section key={n.id}>
                <h2 className="border-b-2 border-ink pb-1.5 text-sm font-bold uppercase tracking-wide"><SmartLink href={n.url} className="hover:text-seal">{lang === 'en' && n.labelEn ? n.labelEn : n.label}</SmartLink></h2>
                <ul className="mt-2 space-y-1.5 text-sm">{n.children.map((c) => <li key={c.id}><SmartLink href={c.url} className="hover:text-navy">{lang === 'en' && c.labelEn ? c.labelEn : c.label}</SmartLink></li>)}</ul>
              </section>
            ))}
            <section>
              <h2 className="border-b-2 border-ink pb-1.5 text-sm font-bold uppercase tracking-wide">{t('Chuyên mục tin', 'News categories')}</h2>
              <ul className="mt-2 space-y-1.5 text-sm">{(cats.data ?? []).filter((c) => c.isVisible).map((c) => <li key={c.id}><Link href={`/tin-tuc/chuyen-muc/${c.slug}`} className="hover:text-navy">{lang === 'en' && c.nameEn ? c.nameEn : c.name}</Link></li>)}</ul>
            </section>
            <section>
              <h2 className="flex items-center gap-2 border-b-2 border-ink pb-1.5 text-sm font-bold uppercase tracking-wide"><MapIcon className="h-4 w-4 text-seal" />{t('Tiện ích', 'Utilities')}</h2>
              <ul className="mt-2 space-y-1.5 text-sm">{extra.map((e) => <li key={e.href}><Link href={e.href} className="hover:text-navy">{e.l}</Link></li>)}</ul>
            </section>
          </div>
        )}
      </div>
    </>
  );
}

/* ================= RSS ================= */
export function RssPage() {
  const { lang, t } = usePortal();
  const title = 'RSS';
  useSeo(title, null);
  const cats = useListCategories();
  const [copied, setCopied] = useState<string | null>(null);
  const [, nav] = useLocation();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const feeds = [{ key: 'all', name: t('Tất cả tin bài', 'All news'), url: apiUrl('rss') }, ...(cats.data ?? []).filter((c) => c.isVisible).map((c) => ({ key: c.slug, name: lang === 'en' && c.nameEn ? c.nameEn : c.name, url: apiUrl(`rss?category=${c.slug}`) }))];
  const copy = (k: string, u: string) => navigator.clipboard?.writeText(origin + u).then(() => { setCopied(k); setTimeout(() => setCopied(null), 1600); });
  return (
    <>
      <PageHeader title={title} kicker={t('Kênh tin', 'Feeds')} crumbs={[{ label: 'RSS' }]} description={t('Đăng ký nhận tin qua trình đọc RSS. Sao chép đường dẫn kênh và dán vào ứng dụng đọc tin.', 'Subscribe with any RSS reader: copy a feed URL into your app.')} />
      <div className="container-portal py-8">
        {cats.isLoading ? <ListSkeleton withImage={false} rows={4} /> : (
          <ul className="max-w-3xl divide-y divide-rule border-y border-rule">
            {feeds.map((f) => (
              <li key={f.key} className="flex flex-wrap items-center gap-3 py-3">
                <Rss className="h-4 w-4 text-seal" />
                <span className="min-w-0 flex-1 font-medium">{f.name}<span className="num block truncate text-xs text-muted-foreground">{origin}{f.url}</span></span>
                <button onClick={() => copy(f.key, f.url)} className="inline-flex items-center gap-1 border border-rule px-2 py-1 text-xs hover:border-navy" data-testid={`button-rss-copy-${f.key}`}>{copied === f.key ? <Check className="h-3 w-3 text-navy" /> : <Copy className="h-3 w-3" />}{t('Sao chép', 'Copy')}</button>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="border border-navy bg-navy px-2 py-1 text-xs font-semibold text-white">XML</a>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => nav('/tin-tuc')} className="mt-6 text-sm text-navy underline-offset-4 hover:underline">{t('Đọc tin trực tiếp trên cổng', 'Read news on the portal')} →</button>
      </div>
    </>
  );
}
