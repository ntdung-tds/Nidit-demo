import { EventCarousel } from '../EventCarousel';
import { Link } from 'wouter';
import { ArrowRight, CalendarDays, Database, Download, FileText, FlaskConical, Image as ImageIcon, MapPin, PlayCircle, ShieldCheck, BookOpen, Search, Landmark, ExternalLink, Rss } from 'lucide-react';
import {
  useGetHomeFeed, getGetHomeFeedQueryKey, useListFields, useListPublications, getListPublicationsQueryKey,
  useListPopularArticles, getListPopularArticlesQueryKey, useListEvaluationServices, useListMenuItems, getListMenuItemsQueryKey,
} from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ACCESS_LABEL, PROJECT_STATUS_LABEL, PUB_TYPE_LABEL, buildMenuTree, fmtDate, fmtDateTime, fmtNum, usePortal, useSeo } from '../lib';
import { ArticleCard, ArticleMeta, ErrorState, FieldIcon, Img, SectionHead, SmartLink, Tag } from '../ui';
import { useMenuLabel } from '../Layout';

function HomeSkeleton() {
  return (
    <div className="container-portal grid gap-6 py-6 lg:grid-cols-[250px_minmax(0,1fr)_280px]">
      <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="space-y-1.5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-16" /></div>)}</div>
      <div className="space-y-3"><Skeleton className="aspect-[16/9.5] w-full rounded-none" /><Skeleton className="h-8 w-5/6" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
      <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-3"><Skeleton className="h-16 w-24 rounded-none" /><div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></div>)}</div>
    </div>
  );
}

export default function HomePage() {
  const { lang, t } = usePortal();
  const label = useMenuLabel();
  useSeo(null, null);
  const params = { lang } as const;
  const feed = useGetHomeFeed(params, { query: { queryKey: getGetHomeFeedQueryKey(params) } });
  const fields = useListFields();
  const pubParams = { pageSize: 5, page: 1 };
  const pubs = useListPublications(pubParams, { query: { queryKey: getListPublicationsQueryKey(pubParams) } });
  const popParams = { lang, limit: 5 } as const;
  const popular = useListPopularArticles(popParams, { query: { queryKey: getListPopularArticlesQueryKey(popParams) } });
  const services = useListEvaluationServices();
  const linkParams = { location: 'links' } as const;
  const links = useListMenuItems(linkParams, { query: { queryKey: getListMenuItemsQueryKey(linkParams) } });

  if (feed.isLoading) return <HomeSkeleton />;
  if (feed.isError || !feed.data) return <div className="container-portal py-16"><ErrorState onRetry={() => feed.refetch()} /></div>;
  const f = feed.data;
  const events = f.sections.find((section) => section.categorySlug === 'su-kien-hoi-thao')?.articles ?? [];
  const slides = (events.length ? events : f.featured.length ? f.featured : f.latest).slice(0, 4);
  const lead = slides[0];
  const sideFeatured = f.featured.slice(1, 6);
  const latest = f.latest.filter((a) => a.id !== lead?.id).slice(0, 8);
  const mostRead = f.mostRead.length ? f.mostRead : popular.data ?? [];

  const stats = [
    { k: t('Lĩnh vực', 'Fields'), v: f.stats.fields, href: '/linh-vuc' },
    { k: t('Nhiệm vụ KH&CN', 'R&D projects'), v: f.stats.projects, href: '/nghien-cuu' },
    { k: t('Công bố khoa học', 'Publications'), v: f.stats.publications, href: '/cong-bo-khoa-hoc' },
    { k: t('Bộ dữ liệu AI', 'AI datasets'), v: f.stats.datasets, href: '/du-lieu-ai' },
    { k: t('Văn bản', 'Documents'), v: f.stats.documents, href: '/van-ban' },
    { k: t('Dịch vụ kiểm định', 'Testing services'), v: f.stats.services, href: '/danh-gia-kiem-dinh' },
  ];

  return (
    <div>
      {/* ===== Front page: three-column newsroom grid ===== */}
      <section className="container-portal pt-6" aria-label={t('Tin nổi bật', 'Top stories')}>
        <div className="grid gap-x-7 gap-y-8 lg:grid-cols-[250px_minmax(0,1fr)_280px]">
          {/* latest */}
          <div className="order-2 lg:order-1 lg:border-r lg:border-rule lg:pr-6">
            <SectionHead title={t('Tin mới nhất', 'Latest')} href="/tin-tuc" />
            <ol className="divide-y divide-rule">
              {latest.map((a) => (
                <li key={a.id} className="py-2.5 first:pt-0">
                  <div className="num text-[0.68rem] font-medium text-seal">{fmtDateTime(a.publishedAt)}</div>
                  <Link href={`/tin-tuc/${a.slug}`} className="headline-link mt-0.5 block text-[0.9rem] font-medium leading-snug text-ink" data-testid={`link-latest-${a.id}`}>{a.title}</Link>
                </li>
              ))}
            </ol>
          </div>
          {/* lead */}
          <div className="order-1 min-w-0 lg:order-2">{slides.length > 0 && <EventCarousel key={`${lang}-${slides.map((a) => a.id).join('-')}`} articles={slides} isEvents={events.length > 0} />}</div>
          {/* featured column */}
          <div className="order-3 lg:border-l lg:border-rule lg:pl-6">
            <SectionHead title={t('Tiêu điểm', 'In focus')} />
            <div className="space-y-4">
              {sideFeatured.map((a) => (
                <article key={a.id} className="group flex gap-3 border-b border-rule pb-4 last:border-0">
                  <Link href={`/tin-tuc/${a.slug}`} className="w-24 shrink-0" tabIndex={-1} aria-hidden><Img src={a.coverImage} alt={a.title} ratio="aspect-[4/3]" /></Link>
                  <h3 className="font-display text-[0.92rem] font-semibold leading-snug text-ink"><Link href={`/tin-tuc/${a.slug}`} className="headline-link">{a.title}</Link></h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Institutional figures ===== */}
      <section className="mt-10 border-y border-rule bg-paper paper-grain" aria-label={t('Số liệu', 'Figures')}>
        <div className="container-portal grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <Link key={s.href} href={s.href} className={`group relative px-4 py-5 transition-colors hover:bg-card ${i > 0 ? 'lg:border-l lg:border-rule' : ''}`} data-testid={`stat-${s.href.slice(1)}`}>
              <div className="num text-[2rem] font-medium leading-none text-navy">{fmtNum(s.v)}</div>
              <div className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground group-hover:text-seal">{s.k}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Fields of activity ===== */}
      <section className="container-portal mt-10">
        <SectionHead title={t('Lĩnh vực hoạt động', 'Fields of activity')} href="/linh-vuc" />
        {fields.isLoading ? (
          <div className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-none" />)}</div>
        ) : (
          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
            {(fields.data ?? []).slice(0, 10).map((fl, i) => (
              <Link key={fl.id} href={`/linh-vuc/${fl.slug}`} className="group relative bg-card p-5 transition-colors hover:bg-paper sm:odd:last:col-span-2 lg:odd:last:col-span-1" data-testid={`card-field-${fl.id}`}>
                <div className="flex items-start justify-between">
                  <FieldIcon name={fl.icon} className="h-6 w-6 text-navy transition-colors group-hover:text-seal" />
                  <span className="num text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-4 font-display text-[1.02rem] font-semibold leading-snug text-ink">{lang === 'en' && fl.nameEn ? fl.nameEn : fl.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground">{lang === 'en' && fl.summaryEn ? fl.summaryEn : fl.summary}</p>
                <div className="meta mt-3 num">{fl.projectCount} {t('nhiệm vụ', 'projects')} · {fl.datasetCount} {t('bộ dữ liệu', 'datasets')}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== Category sections + sidebar ===== */}
      <div className="container-portal mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          {f.sections.filter((s) => s.articles.length).map((sec) => {
            const [first, ...rest] = sec.articles;
            return (
              <section key={sec.categoryId} aria-label={sec.categoryName}>
                <SectionHead title={sec.categoryName} href={`/tin-tuc/chuyen-muc/${sec.categorySlug}`} />
                <div className="grid gap-6 md:grid-cols-[1.25fr_1fr]">
                  <article className="group">
                    <Link href={`/tin-tuc/${first.slug}`} tabIndex={-1} aria-hidden><Img src={first.coverImage} alt={first.title} label={sec.categoryName} /></Link>
                    <h3 className="mt-3 font-display text-[1.25rem] font-semibold leading-snug text-ink"><Link href={`/tin-tuc/${first.slug}`} className="headline-link">{first.title}</Link></h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{first.summary}</p>
                    <ArticleMeta a={first} className="mt-2" />
                  </article>
                  <ul className="divide-y divide-rule">
                    {rest.slice(0, 4).map((a) => (
                      <li key={a.id} className="py-3 first:pt-0">
                        <Link href={`/tin-tuc/${a.slug}`} className="headline-link font-display text-[0.98rem] font-semibold leading-snug text-ink">{a.title}</Link>
                        <div className="meta mt-1 num">{fmtDate(a.publishedAt)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-8">
          <section>
            <SectionHead title={t('Đọc nhiều', 'Most read')} as="h2" />
            <ol className="space-y-3.5">
              {mostRead.slice(0, 5).map((a, i) => (
                <li key={a.id} className="flex gap-3">
                  <span className="num w-6 shrink-0 text-2xl font-medium leading-none text-seal/80">{i + 1}</span>
                  <Link href={`/tin-tuc/${a.slug}`} className="headline-link text-[0.9rem] font-medium leading-snug text-ink">{a.title}</Link>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <SectionHead title={t('Sự kiện sắp diễn ra', 'Upcoming events')} as="h2" />
            {f.upcomingEvents.length === 0 ? (
              <p className="border border-dashed border-rule p-4 text-sm text-muted-foreground">{t('Chưa có sự kiện mới được công bố.', 'No upcoming events announced.')}</p>
            ) : (
              <ul className="space-y-3">
                {f.upcomingEvents.slice(0, 4).map((e) => {
                  const d = e.eventStartAt ? new Date(e.eventStartAt) : null;
                  return (
                    <li key={e.id} className="flex gap-3 border border-rule bg-card p-3">
                      <div className="w-12 shrink-0 border-r border-rule pr-3 text-center">
                        <div className="num text-xl font-medium leading-none text-navy">{d ? String(d.getDate()).padStart(2, '0') : '--'}</div>
                        <div className="mt-1 text-[0.62rem] font-semibold uppercase text-seal">{d ? `T${d.getMonth() + 1}` : ''}</div>
                      </div>
                      <div className="min-w-0">
                        <Link href={`/tin-tuc/${e.slug}`} className="headline-link line-clamp-2 text-[0.86rem] font-semibold leading-snug text-ink">{e.title}</Link>
                        {e.eventLocation && <div className="meta mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /><span className="truncate">{e.eventLocation}</span></div>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section>
            <SectionHead title={t('Văn bản mới', 'New documents')} href="/van-ban" as="h2" />
            <ul className="divide-y divide-rule border-y border-rule">
              {f.latestDocuments.slice(0, 5).map((d) => (
                <li key={d.id} className="py-3">
                  <div className="flex items-center gap-2"><Tag>{d.docType}</Tag><span className="num text-xs font-medium text-navy">{d.number}</span></div>
                  <Link href={`/van-ban/${d.id}`} className="headline-link mt-1.5 line-clamp-2 block text-[0.85rem] leading-snug text-ink">{d.title}</Link>
                  <div className="meta mt-1 num">{fmtDate(d.issuedDate)}</div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* ===== Research ===== */}
      <section className="mt-14 bg-navy py-12 text-white">
        <div className="container-portal">
          <div className="mb-6 flex items-end justify-between border-b border-white/20 pb-2">
            <h2 className="text-[0.95rem] font-bold uppercase tracking-[0.06em]"><span className="mr-2 inline-block h-3 w-3 bg-seal align-middle" />{t('Nghiên cứu – Đề tài, dự án', 'Research projects')}</h2>
            <Link href="/nghien-cuu" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white">{t('Tất cả nhiệm vụ', 'All projects')}<ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid gap-px bg-white/15 md:grid-cols-2 lg:grid-cols-3">
            {f.featuredProjects.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/nghien-cuu/${p.slug}`} className="group flex flex-col bg-navy p-6 transition-colors hover:bg-navy-deep" data-testid={`card-project-${p.id}`}>
                <div className="flex items-center justify-between gap-2 text-[0.7rem]">
                  <span className="num text-gold">{p.code}</span>
                  <span className="border border-white/25 px-1.5 py-0.5 uppercase tracking-wide text-white/75">{PROJECT_STATUS_LABEL[p.status]?.[lang === 'en' ? 1 : 0]}</span>
                </div>
                <h3 className="mt-4 font-display text-[1.12rem] font-semibold leading-snug text-white group-hover:underline group-hover:decoration-seal group-hover:underline-offset-4">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">{p.summary}</p>
                <div className="mt-auto pt-5 text-xs text-white/55">{p.level} · {p.leadName} · <span className="num">{p.startYear}–{p.endYear ?? '…'}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Publications + datasets ===== */}
      <div className="container-portal mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionHead title={t('Công bố khoa học', 'Scientific publications')} href="/cong-bo-khoa-hoc" />
          {pubs.isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
            <ol className="divide-y divide-rule">
              {(pubs.data?.items ?? []).map((p) => (
                <li key={p.id} className="flex gap-4 py-3.5 first:pt-0">
                  <span className="num w-11 shrink-0 pt-0.5 text-sm font-medium text-navy">{p.year}</span>
                  <div className="min-w-0">
                    <p className="font-display text-[0.95rem] font-semibold leading-snug text-ink">{p.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{p.authors} — <em>{p.venue}</em></p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5"><Tag tone="muted">{PUB_TYPE_LABEL[p.type]?.[lang === 'en' ? 1 : 0]}</Tag>{p.indexing && <Tag tone="gold">{p.indexing}</Tag>}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section>
          <SectionHead title={t('Dữ liệu phục vụ AI', 'AI-ready data')} href="/du-lieu-ai" />
          <div className="space-y-3">
            {f.featuredDatasets.slice(0, 4).map((d) => (
              <Link key={d.id} href={`/du-lieu-ai/${d.slug}`} className="group flex gap-4 border border-rule bg-card p-4 transition-colors hover:border-navy/40" data-testid={`card-dataset-${d.id}`}>
                <div className="grid h-11 w-11 shrink-0 place-items-center bg-secondary text-navy"><Database className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-[0.95rem] font-semibold leading-snug text-ink group-hover:text-seal">{d.title}</h3>
                    <Tag tone={d.accessLevel === 'open' ? 'navy' : d.accessLevel === 'registered' ? 'gold' : 'seal'}>{ACCESS_LABEL[d.accessLevel]?.[lang === 'en' ? 1 : 0]}</Tag>
                  </div>
                  <div className="meta mt-1.5 num">{fmtNum(d.recordCount)} {t('bản ghi', 'records')} · {d.sizeLabel} · {d.formats.join(', ')}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Library ===== */}
      {f.albums.length > 0 && (
        <section className="container-portal mt-12">
          <SectionHead title={t('Thư viện ảnh – video', 'Media library')} href="/thu-vien" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {f.albums.slice(0, 4).map((al) => (
              <Link key={al.id} href={`/thu-vien/${al.slug}`} className="group" data-testid={`card-album-${al.id}`}>
                <div className="relative">
                  <Img src={al.coverImage} alt={al.title} ratio="aspect-[4/3]" label={al.title} />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-navy-deep/85 px-2 py-1 text-[0.68rem] font-semibold text-white">
                    {al.type === 'video' ? <PlayCircle className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}{al.itemCount}
                  </span>
                </div>
                <h3 className="mt-2.5 font-display text-[0.95rem] font-semibold leading-snug text-ink group-hover:text-seal">{al.title}</h3>
                <div className="meta mt-1 num">{fmtDate(al.eventDate ?? al.createdAt)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== More news cards ===== */}
      {f.latest.length > 9 && (
        <section className="container-portal mt-12">
          <SectionHead title={t('Tin khác', 'More news')} href="/tin-tuc" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{f.latest.slice(9, 13).map((a) => <ArticleCard key={a.id} a={a} size="sm" />)}</div>
        </section>
      )}

      {/* ===== Quick links ===== */}
      <section className="container-portal mt-14">
        <SectionHead title={t('Truy cập nhanh', 'Quick access')} />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-3">
            {[
              { href: '/van-ban', icon: FileText, l: t('Tra cứu văn bản', 'Find documents') },
              { href: '/du-lieu-ai', icon: Database, l: t('Kho dữ liệu AI', 'AI data catalogue') },
              { href: '/danh-gia-kiem-dinh', icon: ShieldCheck, l: t('Đăng ký kiểm định', 'Request testing') },
              { href: '/cong-bo-khoa-hoc', icon: BookOpen, l: t('Công bố khoa học', 'Publications') },
              { href: '/nghien-cuu', icon: FlaskConical, l: t('Nhiệm vụ KH&CN', 'R&D projects') },
              { href: '/tim-kiem', icon: Search, l: t('Tìm kiếm nâng cao', 'Search') },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="group flex items-center gap-3 bg-card px-4 py-4 hover:bg-paper" data-testid={`link-quick-${q.href.slice(1)}`}>
                <q.icon className="h-5 w-5 shrink-0 text-seal" />
                <span className="text-sm font-semibold text-ink group-hover:text-navy">{q.l}</span>
              </Link>
            ))}
          </div>
          <div className="border border-rule bg-paper p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-ink"><Landmark className="h-4 w-4 text-navy" />{t('Cổng thông tin liên quan', 'Government portals')}</div>
            <ul className="mt-3 divide-y divide-rule">
              {buildMenuTree(links.data).flatMap((n) => [n, ...n.children]).slice(0, 6).map((l) => (
                <li key={l.id}><SmartLink href={l.url} newTab={l.openInNewTab} className="flex items-center justify-between py-2 text-sm hover:text-seal">{label(l)}<ExternalLink className="h-3.5 w-3.5 opacity-50" /></SmartLink></li>
              ))}
            </ul>
            <div className="mt-4 border-t border-rule pt-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-ink"><Rss className="h-4 w-4 text-seal" />{t('Nguồn tin cập nhật tự động', 'Automatic official feeds')}</div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{t('RSS chính thống được thu thập định kỳ và đưa vào hàng chờ biên tập trước khi xuất bản.', 'Official RSS feeds are collected periodically and queued for editorial review before publication.')}</p>
              <ul className="mt-2 divide-y divide-rule border-y border-rule">
                <li><SmartLink href="https://mst.gov.vn/rss/tin-tuc-su-kien/chuyen-doi-so.rss" newTab className="flex items-center justify-between gap-3 py-2 text-[12.5px] font-medium hover:text-seal"><span>{t('Bộ KH&CN – Chuyển đổi số', 'Ministry of Science and Technology – Digital transformation')}</span><span className="num shrink-0 text-[10px] text-muted-foreground">RSS</span></SmartLink></li>
                <li><SmartLink href="https://congbao.chinhphu.vn/cac-van-ban-moi-ban-hanh.rss" newTab className="flex items-center justify-between gap-3 py-2 text-[12.5px] font-medium hover:text-seal"><span>{t('Công báo điện tử Chính phủ – Văn bản mới', 'Government Gazette – New documents')}</span><span className="num shrink-0 text-[10px] text-muted-foreground">RSS</span></SmartLink></li>
              </ul>
            </div>
            {(services.data ?? []).length > 0 && (
              <div className="mt-4 border-t border-rule pt-3">
                <div className="text-xs font-semibold text-muted-foreground">{t('Dịch vụ đánh giá – kiểm định', 'Testing services')}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {services.data!.slice(0, 5).map((s) => <Link key={s.id} href={`/danh-gia-kiem-dinh/${s.slug}`} className="border border-rule bg-card px-2 py-1 text-xs hover:border-navy hover:text-navy">{s.name}</Link>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-portal mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        {import.meta.env.VITE_GITHUB_PAGES === 'true' ? t('Nội dung minh họa', 'Demo content') : t('Cập nhật liên tục', 'Continuously updated')}
        · <Download className="h-3.5 w-3.5" /><a href={import.meta.env.VITE_GITHUB_PAGES === 'true' ? `${import.meta.env.BASE_URL}rss.xml` : `${import.meta.env.BASE_URL}api/rss.xml`} className="hover:text-seal">RSS</a>
      </div>
    </div>
  );
}
