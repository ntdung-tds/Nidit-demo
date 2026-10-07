import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { CalendarDays, Clock, Copy, Eye, Facebook, Linkedin, Mail, MapPin, Printer, Tag as TagIcon, Check, Newspaper, Minus, Plus, ExternalLink } from 'lucide-react';
import {
  useListArticles, getListArticlesQueryKey, useListCategories, useGetArticle, getGetArticleQueryKey,
  useListPopularArticles, getListPopularArticlesQueryKey, ApiError, type Category,
} from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fmtDate, fmtDateTime, fmtNum, useQS, usePortal, useSeo, useTracker } from '../lib';
import { ArticleCard, ArticleRow, Breadcrumb, EmptyState, ErrorState, Img, ListSkeleton, PageHeader, Pagination, SectionHead, SideBox } from '../ui';
import NotFoundPage from './NotFound';

type CatNode = Category & { children: CatNode[] };
export function useCategoryTree() {
  const q = useListCategories();
  const tree = useMemo(() => {
    const vis = (q.data ?? []).filter((c) => c.isVisible);
    const m = new Map<number, CatNode>();
    vis.forEach((c) => m.set(c.id, { ...c, children: [] }));
    const roots: CatNode[] = [];
    m.forEach((n) => (n.parentId && m.has(n.parentId) ? m.get(n.parentId)!.children.push(n) : roots.push(n)));
    const s = (a: CatNode[]) => { a.sort((x, y) => x.sortOrder - y.sortOrder); a.forEach((c) => s(c.children)); };
    s(roots);
    return roots;
  }, [q.data]);
  return { ...q, tree };
}

function PopularBox() {
  const { lang, t } = usePortal();
  const p = { lang, limit: 6 } as const;
  const q = useListPopularArticles(p, { query: { queryKey: getListPopularArticlesQueryKey(p) } });
  return (
    <SideBox title={t('Đọc nhiều', 'Most read')}>
      {q.isLoading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div> : (
        <ol className="space-y-3">
          {(q.data ?? []).map((a, i) => (
            <li key={a.id} className="flex gap-2.5">
              <span className="num w-5 shrink-0 text-lg leading-none text-seal">{i + 1}</span>
              <Link href={`/tin-tuc/${a.slug}`} className="headline-link text-sm leading-snug text-ink">{a.title}</Link>
            </li>
          ))}
        </ol>
      )}
    </SideBox>
  );
}

function CategoryNav({ active }: { active?: string }) {
  const { lang, t } = usePortal();
  const { tree, isLoading } = useCategoryTree();
  const nm = (c: Category) => (lang === 'en' && c.nameEn ? c.nameEn : c.name);
  return (
    <SideBox title={t('Chuyên mục', 'Categories')}>
      {isLoading ? <Skeleton className="h-40" /> : (
        <ul className="space-y-0.5">
          <li><Link href="/tin-tuc" className={cn('block border-l-2 px-3 py-1.5 text-sm', !active ? 'border-seal bg-secondary/70 font-semibold' : 'border-transparent hover:bg-muted')}>{t('Tất cả tin', 'All news')}</Link></li>
          {tree.map((c) => (
            <li key={c.id}>
              <Link href={`/tin-tuc/chuyen-muc/${c.slug}`} className={cn('flex justify-between border-l-2 px-3 py-1.5 text-sm', active === c.slug ? 'border-seal bg-secondary/70 font-semibold' : 'border-transparent hover:bg-muted')} data-testid={`link-category-${c.slug}`}>
                <span>{nm(c)}</span><span className="num text-xs text-muted-foreground">{c.articleCount}</span>
              </Link>
              {c.children.length > 0 && (
                <ul className="ml-3">
                  {c.children.map((ch) => (
                    <li key={ch.id}><Link href={`/tin-tuc/chuyen-muc/${ch.slug}`} className={cn('flex justify-between border-l px-3 py-1 text-[0.82rem]', active === ch.slug ? 'border-seal font-semibold text-ink' : 'border-rule text-muted-foreground hover:text-ink')}><span>{nm(ch)}</span><span className="num text-xs">{ch.articleCount}</span></Link></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </SideBox>
  );
}

function ArticleListing({ category }: { category?: Category }) {
  const { lang, t } = usePortal();
  const { params, set } = useQS();
  const page = Number(params.get('page') ?? 1) || 1;
  const tag = params.get('tag') ?? undefined;
  const q = params.get('q') ?? undefined;
  const p = { page, pageSize: 10, lang, category: category?.slug ?? params.get('category') ?? undefined, tag, q };
  const list = useListArticles(p, { query: { queryKey: getListArticlesQueryKey(p) } });
  const [term, setTerm] = useState(q ?? '');
  const items = list.data?.items ?? [];
  const [top, ...rest] = items;

  return (
    <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_300px]">
      <div>
        <form onSubmit={(e) => { e.preventDefault(); set({ q: term }); }} className="mb-6 flex flex-wrap items-center gap-2">
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('Lọc theo từ khóa…', 'Filter by keyword…')} className="h-10 min-w-0 flex-1 border border-rule bg-card px-3 text-sm outline-none focus:border-navy" data-testid="input-news-filter" />
          <button className="h-10 bg-navy px-4 text-sm font-semibold text-primary-foreground hover:bg-navy-deep" data-testid="button-news-filter">{t('Lọc', 'Filter')}</button>
          {(tag || q) && (
            <div className="flex w-full flex-wrap items-center gap-2 text-sm">
              {tag && <span className="inline-flex items-center gap-1 border border-navy/30 bg-secondary px-2 py-0.5"><TagIcon className="h-3 w-3" />{tag}</span>}
              {q && <span className="border border-rule bg-muted px-2 py-0.5">“{q}”</span>}
              <button type="button" onClick={() => { setTerm(''); set({ tag: null, q: null }); }} className="text-xs text-seal underline">{t('Bỏ lọc', 'Clear')}</button>
            </div>
          )}
        </form>
        {list.isLoading ? <ListSkeleton /> : list.isError ? <ErrorState onRetry={() => list.refetch()} /> : items.length === 0 ? (
          <EmptyState icon={Newspaper} title={t('Chưa có bài viết phù hợp', 'No matching articles')} hint={t('Thử bỏ bớt bộ lọc hoặc chọn chuyên mục khác.', 'Try removing filters or choosing another category.')} />
        ) : (
          <>
            {page === 1 && top && (
              <article className="group mb-7 grid gap-5 border-b border-rule pb-7 md:grid-cols-[1.3fr_1fr]">
                <Link href={`/tin-tuc/${top.slug}`} tabIndex={-1} aria-hidden><Img src={top.coverImage} alt={top.title} label={top.categoryName ?? undefined} /></Link>
                <div>
                  {top.categoryName && <div className="kicker">{top.categoryName}</div>}
                  <h2 className="mt-1.5 font-display text-[1.45rem] font-bold leading-tight text-ink"><Link href={`/tin-tuc/${top.slug}`} className="headline-link">{top.title}</Link></h2>
                  <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{top.summary}</p>
                  <div className="meta mt-3 num">{fmtDateTime(top.publishedAt)}</div>
                </div>
              </article>
            )}
            <div className="space-y-5">{(page === 1 ? rest : items).map((a) => <ArticleRow key={a.id} a={a} />)}</div>
            <Pagination page={page} totalPages={list.data?.totalPages ?? 1} onPage={(n) => set({ page: n }, false)} />
            <p className="meta mt-3 text-center num">{t('Tổng số', 'Total')}: {fmtNum(list.data?.total)} {t('bài viết', 'articles')}</p>
          </>
        )}
      </div>
      <aside className="space-y-6"><CategoryNav active={category?.slug} /><PopularBox /></aside>
    </div>
  );
}

export function NewsPage() {
  const { t } = usePortal();
  useSeo(t('Tin tức – Sự kiện', 'News & Events'), null);
  return (
    <>
      <PageHeader title={t('Tin tức – Sự kiện', 'News & Events')} kicker={t('Thông tin chính thức', 'Official news')} crumbs={[{ label: t('Tin tức', 'News') }]} description={t('Hoạt động của Viện, tin chuyển đổi số trong nước và quốc tế, thông báo và sự kiện khoa học.', 'Institute activities, digital transformation news, announcements and scientific events.')} />
      <ArticleListing />
    </>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = usePortal();
  const cats = useListCategories();
  const cat = cats.data?.find((c) => c.slug === slug);
  const name = cat ? (lang === 'en' && cat.nameEn ? cat.nameEn : cat.name) : '';
  useSeo(name || t('Chuyên mục', 'Category'), cat?.description);
  if (cats.isLoading) return <div className="container-portal py-10"><ListSkeleton /></div>;
  if (!cat) return <NotFoundPage />;
  return (
    <>
      <PageHeader title={name} kicker={t('Chuyên mục', 'Category')} description={cat.description} crumbs={[{ label: t('Tin tức', 'News'), href: '/tin-tuc' }, { label: name }]} />
      <ArticleListing category={cat} />
    </>
  );
}

function ShareBar({ title }: { title: string }) {
  const { t } = usePortal();
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const u = encodeURIComponent(url);
  const ti = encodeURIComponent(title);
  const cls = 'grid h-8 w-8 place-items-center border border-rule bg-card text-foreground/70 hover:border-navy hover:text-navy';
  return (
    <div className="no-print flex items-center gap-1.5">
      <a className={cls} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="link-share-facebook"><Facebook className="h-3.5 w-3.5" /></a>
      <a className={cn(cls, 'text-[0.8rem] font-bold')} href={`https://twitter.com/intent/tweet?url=${u}&text=${ti}`} target="_blank" rel="noopener noreferrer" aria-label="X" data-testid="link-share-x">X</a>
      <a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-testid="link-share-linkedin"><Linkedin className="h-3.5 w-3.5" /></a>
      <a className={cls} href={`mailto:?subject=${ti}&body=${u}`} aria-label="Email" data-testid="link-share-email"><Mail className="h-3.5 w-3.5" /></a>
      <button className={cls} onClick={() => { navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }} aria-label={t('Sao chép liên kết', 'Copy link')} data-testid="button-copy-link">
        {copied ? <Check className="h-3.5 w-3.5 text-navy" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = usePortal();
  const q = useGetArticle(slug, { query: { enabled: !!slug, queryKey: getGetArticleQueryKey(slug) } });
  const art = q.data?.article;
  const [size, setSize] = useState(1);
  useSeo(art ? art.seoTitle || art.title : null, art ? art.seoDescription || art.summary : null);
  const track = useTracker();
  useEffect(() => { if (art) track(`/tin-tuc/${art.slug}`, art.id); }, [art?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (q.isLoading) return (
    <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4"><Skeleton className="h-3 w-48" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-3/4" /><Skeleton className="aspect-video w-full rounded-none" />{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
      <Skeleton className="h-80" />
    </div>
  );
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !art) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;
  const related = q.data?.related ?? [];
  const sizes = ['0.95rem', '1.0625rem', '1.2rem'];

  return (
    <div className="container-portal grid gap-10 py-7 lg:grid-cols-[1fr_300px]">
      <article className="min-w-0 fade-up">
        <Breadcrumb items={[{ label: t('Tin tức', 'News'), href: '/tin-tuc' }, ...(art.categoryName && art.categorySlug ? [{ label: art.categoryName, href: `/tin-tuc/chuyen-muc/${art.categorySlug}` }] : [])]} />
        {art.categoryName && <div className="kicker mt-5">{art.categoryName}</div>}
        <h1 className="mt-2 font-display text-[1.8rem] font-bold leading-[1.22] text-ink md:text-[2.35rem]" data-testid="text-article-title">{art.title}</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-rule py-2.5">
          <div className="meta flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1 num"><CalendarDays className="h-3.5 w-3.5" />{fmtDateTime(art.publishedAt)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{art.readingMinutes} {t('phút đọc', 'min read')}</span>
            <span className="inline-flex items-center gap-1 num"><Eye className="h-3.5 w-3.5" />{fmtNum(art.viewCount)}</span>
          </div>
          <div className="no-print flex items-center gap-1.5">
            <button onClick={() => setSize((s) => Math.max(0, s - 1))} className="grid h-8 w-8 place-items-center border border-rule bg-card hover:border-navy" aria-label={t('Giảm cỡ chữ', 'Smaller text')} data-testid="button-article-font-down"><Minus className="h-3.5 w-3.5" /></button>
            <button onClick={() => setSize((s) => Math.min(2, s + 1))} className="grid h-8 w-8 place-items-center border border-rule bg-card hover:border-navy" aria-label={t('Tăng cỡ chữ', 'Larger text')} data-testid="button-article-font-up"><Plus className="h-3.5 w-3.5" /></button>
            <button onClick={() => window.print()} className="grid h-8 w-8 place-items-center border border-rule bg-card hover:border-navy" aria-label={t('In bài', 'Print')} data-testid="button-print"><Printer className="h-3.5 w-3.5" /></button>
            <span className="mx-1 h-5 w-px bg-rule" />
            <ShareBar title={art.title} />
          </div>
        </div>
        {art.eventStartAt && (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-l-4 border-seal bg-paper px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-seal" /><strong>{t('Thời gian', 'When')}:</strong> <span className="num">{fmtDateTime(art.eventStartAt)}</span></span>
            {art.eventLocation && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-seal" /><strong>{t('Địa điểm', 'Where')}:</strong> {art.eventLocation}</span>}
          </div>
        )}
        <p className="mt-5 font-display text-[1.12rem] font-semibold leading-relaxed text-ink/90">{art.summary}</p>
        {art.coverImage && (
          <figure className="mt-5">
            <Img src={art.coverImage} alt={art.coverCaption ?? art.title} ratio="aspect-[16/9]" />
            {art.coverCaption && <figcaption className="mt-2 text-center text-xs italic text-muted-foreground">{art.coverCaption}</figcaption>}
          </figure>
        )}
        <div className="prose-portal mt-6" style={{ fontSize: sizes[size] }} dangerouslySetInnerHTML={{ __html: art.content }} data-testid="article-content" />
        <div className="mt-8 border-t border-rule pt-4 text-right text-sm">
          {art.sourceName ? (
            <span>{t('Nguồn', 'Source')}: {art.sourceUrl ? <a href={art.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy hover:underline">{art.sourceName}<ExternalLink className="h-3 w-3" /></a> : <strong>{art.sourceName}</strong>}</span>
          ) : art.authorName ? <strong className="font-display">{art.authorName}</strong> : null}
        </div>
        {art.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            {art.tags.map((tg) => <Link key={tg} href={`/tin-tuc?tag=${encodeURIComponent(tg)}`} className="border border-rule bg-card px-2.5 py-1 text-xs hover:border-navy hover:text-navy" data-testid={`link-tag-${tg}`}>{tg}</Link>)}
          </div>
        )}
        <div className="no-print mt-6 flex items-center justify-between border-y border-rule py-3"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Chia sẻ bài viết', 'Share')}</span><ShareBar title={art.title} /></div>
        {related.length > 0 && (
          <section className="no-print mt-10">
            <SectionHead title={t('Tin liên quan', 'Related')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.slice(0, 6).map((a) => <ArticleCard key={a.id} a={a} size="sm" />)}</div>
          </section>
        )}
      </article>
      <aside className="no-print space-y-6 lg:sticky lg:top-16 lg:self-start">
        <PopularBox />
        <CategoryNav active={art.categorySlug ?? undefined} />
        <p className="meta">{t('Cập nhật', 'Updated')}: <span className="num">{fmtDate(art.updatedAt)}</span></p>
      </aside>
    </div>
  );
}
