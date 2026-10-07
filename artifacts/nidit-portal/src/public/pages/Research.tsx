import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { BookOpen, Check, Circle, ExternalLink, FileText, FlaskConical, Quote, Search, Users, Database, ShieldCheck } from 'lucide-react';
import {
  useListFields, useGetField, getGetFieldQueryKey, useListProjects, getListProjectsQueryKey, useGetProject, getGetProjectQueryKey,
  useListPublications, getListPublicationsQueryKey, ApiError, type Project, type Publication, type ProjectStatus, type PublicationType,
} from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PROJECT_STATUS_LABEL, PUB_TYPE_LABEL, fmtDate, fmtNum, useQS, usePortal, useSeo } from '../lib';
import { ArticleCard, EmptyState, ErrorState, FacetButton, FieldIcon, ListSkeleton, PageHeader, PageSkeleton, Pagination, SectionHead, SideBox, Tag } from '../ui';
import NotFoundPage from './NotFound';

/* ================= Fields ================= */
export function FieldsPage() {
  const { lang, t } = usePortal();
  const title = t('Lĩnh vực hoạt động', 'Fields of activity');
  useSeo(title, null);
  const q = useListFields();
  return (
    <>
      <PageHeader title={title} kicker={t('Định hướng nghiên cứu', 'Research directions')} crumbs={[{ label: title }]} description={t('Các lĩnh vực trọng tâm Viện được giao nghiên cứu, phát triển, thử nghiệm và chuyển giao.', 'Core areas of research, development, testing and transfer.')} />
      <div className="container-portal py-8">
        {q.isLoading ? <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}</div> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : (
          <div className="grid gap-px border border-rule bg-rule md:grid-cols-2">
            {[...(q.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).map((f, i) => (
              <Link key={f.id} href={`/linh-vuc/${f.slug}`} className="group flex gap-5 bg-card p-6 hover:bg-paper" data-testid={`card-field-${f.id}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center border border-navy/25 bg-secondary text-navy group-hover:border-seal group-hover:text-seal"><FieldIcon name={f.icon} className="h-6 w-6" /></div>
                  <span className="num text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{f.shortName}</div>
                  <h2 className="mt-1 font-display text-[1.2rem] font-semibold leading-snug text-ink group-hover:text-navy">{lang === 'en' && f.nameEn ? f.nameEn : f.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{lang === 'en' && f.summaryEn ? f.summaryEn : f.summary}</p>
                  <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    {[[t('Nhiệm vụ', 'Projects'), f.projectCount], [t('Công bố', 'Publications'), f.publicationCount], [t('Dữ liệu', 'Datasets'), f.datasetCount], [t('Dịch vụ', 'Services'), f.serviceCount]].map(([k, v]) => (
                      <div key={String(k)}><dd className="num inline font-semibold text-navy">{v}</dd> <dt className="inline text-muted-foreground">{k}</dt></div>
                    ))}
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function FieldDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = usePortal();
  const q = useGetField(slug, { query: { enabled: !!slug, queryKey: getGetFieldQueryKey(slug) } });
  const f = q.data?.field;
  const name = f ? (lang === 'en' && f.nameEn ? f.nameEn : f.name) : '';
  useSeo(name || null, f ? (lang === 'en' && f.summaryEn ? f.summaryEn : f.summary) : null);
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !q.data || !f) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;
  const d = q.data;
  return (
    <>
      <PageHeader title={name} kicker={f.shortName} description={lang === 'en' && f.summaryEn ? f.summaryEn : f.summary} crumbs={[{ label: t('Lĩnh vực', 'Fields'), href: '/linh-vuc' }, { label: name }]} />
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-10">
          <div className="prose-portal" dangerouslySetInnerHTML={{ __html: f.description }} />
          {d.projects.length > 0 && <section><SectionHead title={t('Nhiệm vụ, đề tài', 'Projects')} href={`/nghien-cuu?fieldId=${f.id}`} /><div className="grid gap-4 md:grid-cols-2">{d.projects.slice(0, 4).map((p) => <ProjectCard key={p.id} p={p} />)}</div></section>}
          {d.publications.length > 0 && <section><SectionHead title={t('Công bố khoa học', 'Publications')} href={`/cong-bo-khoa-hoc?fieldId=${f.id}`} /><div className="divide-y divide-rule">{d.publications.slice(0, 5).map((p) => <PublicationRow key={p.id} p={p} />)}</div></section>}
          {d.datasets.length > 0 && (
            <section><SectionHead title={t('Bộ dữ liệu', 'Datasets')} href={`/du-lieu-ai?fieldId=${f.id}`} />
              <ul className="grid gap-3 md:grid-cols-2">{d.datasets.slice(0, 4).map((ds) => <li key={ds.id}><Link href={`/du-lieu-ai/${ds.slug}`} className="flex gap-3 border border-rule bg-card p-4 hover:border-navy/40"><Database className="h-5 w-5 shrink-0 text-navy" /><div><div className="font-display text-sm font-semibold text-ink">{ds.title}</div><div className="meta mt-1 num">{fmtNum(ds.recordCount)} {t('bản ghi', 'records')}</div></div></Link></li>)}</ul>
            </section>
          )}
          {d.articles.length > 0 && <section><SectionHead title={t('Tin liên quan', 'Related news')} /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{d.articles.slice(0, 3).map((a) => <ArticleCard key={a.id} a={a} size="sm" />)}</div></section>}
        </div>
        <aside className="space-y-6">
          {f.highlights.length > 0 && <SideBox title={t('Hướng trọng tâm', 'Focus areas')}><ul className="space-y-2 text-sm">{f.highlights.map((h, i) => <li key={i} className="flex gap-2"><span className="num text-xs text-seal">{String(i + 1).padStart(2, '0')}</span>{h}</li>)}</ul></SideBox>}
          {d.services.length > 0 && <SideBox title={t('Dịch vụ kiểm định', 'Testing services')}><ul className="space-y-2 text-sm">{d.services.map((s) => <li key={s.id}><Link href={`/danh-gia-kiem-dinh/${s.slug}`} className="flex gap-2 hover:text-navy"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-seal" />{s.name}</Link></li>)}</ul></SideBox>}
          {d.documents.length > 0 && <SideBox title={t('Văn bản liên quan', 'Documents')}><ul className="divide-y divide-rule text-sm">{d.documents.slice(0, 5).map((doc) => <li key={doc.id} className="py-2"><Link href={`/van-ban/${doc.id}`} className="hover:text-navy"><span className="num block text-xs text-navy">{doc.number}</span><span className="line-clamp-2">{doc.title}</span></Link></li>)}</ul></SideBox>}
        </aside>
      </div>
    </>
  );
}

/* ================= Projects ================= */
function statusTone(s: string) { return s === 'completed' ? 'navy' : s === 'ongoing' ? 'seal' : 'gold'; }

export function ProjectCard({ p }: { p: Project }) {
  const { lang } = usePortal();
  return (
    <Link href={`/nghien-cuu/${p.slug}`} className="group flex flex-col border border-rule bg-card p-5 transition-colors hover:border-navy/40" data-testid={`card-project-${p.id}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="num text-xs font-medium text-navy">{p.code}</span>
        <Tag tone={statusTone(p.status) as 'navy'}>{PROJECT_STATUS_LABEL[p.status]?.[lang === 'en' ? 1 : 0]}</Tag>
      </div>
      <h3 className="mt-3 font-display text-[1.05rem] font-semibold leading-snug text-ink group-hover:text-navy">{p.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
      <div className="meta mt-auto pt-4">{p.type} · {p.level} · <span className="num">{p.startYear}–{p.endYear ?? '…'}</span></div>
    </Link>
  );
}

export function ProjectsPage() {
  const { lang, t } = usePortal();
  const title = t('Nghiên cứu – Đề tài, dự án', 'Research projects');
  useSeo(title, null);
  const { params, set } = useQS();
  const page = Number(params.get('page') ?? 1) || 1;
  const status = (params.get('status') ?? undefined) as ProjectStatus | undefined;
  const fieldId = params.get('fieldId') ? Number(params.get('fieldId')) : undefined;
  const qq = params.get('q') ?? undefined;
  const p = { page, pageSize: 12, status, fieldId, q: qq };
  const list = useListProjects(p, { query: { queryKey: getListProjectsQueryKey(p) } });
  const fields = useListFields();
  const [term, setTerm] = useState(qq ?? '');
  const counts = list.data?.statusCounts ?? [];
  const total = counts.reduce((s, c) => s + c.count, 0);

  return (
    <>
      <PageHeader title={title} kicker={t('Nhiệm vụ khoa học và công nghệ', 'R&D portfolio')} crumbs={[{ label: t('Nghiên cứu', 'Research') }]} description={t('Danh mục nhiệm vụ cấp quốc gia, cấp Bộ và cấp cơ sở do Viện chủ trì hoặc tham gia.', 'National, ministerial and institutional projects led or co-led by the Institute.')}>
        <div className="mt-6 flex flex-wrap gap-px border border-rule bg-rule">
          {[{ s: undefined, l: t('Tất cả', 'All'), c: total }, ...(['ongoing', 'completed', 'proposed'] as const).map((s) => ({ s, l: PROJECT_STATUS_LABEL[s][lang === 'en' ? 1 : 0], c: counts.find((x) => x.status === s)?.count ?? 0 }))].map((x) => (
            <button key={x.l} onClick={() => set({ status: x.s ?? null })} className={cn('flex min-w-[140px] flex-1 flex-col items-start px-4 py-3 text-left', status === x.s ? 'bg-navy text-white' : 'bg-card hover:bg-paper')} data-testid={`button-status-${x.s ?? 'all'}`}>
              <span className="num text-2xl font-medium leading-none">{x.c}</span>
              <span className={cn('mt-1 text-xs font-semibold uppercase tracking-wide', status === x.s ? 'text-white/75' : 'text-muted-foreground')}>{x.l}</span>
            </button>
          ))}
        </div>
      </PageHeader>
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); set({ q: term }); }} className="flex border border-rule bg-card focus-within:border-navy">
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('Tên, mã số, chủ nhiệm…', 'Title, code, lead…')} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" data-testid="input-project-search" />
            <button className="grid w-10 place-items-center bg-navy text-white" aria-label={t('Tìm', 'Search')}><Search className="h-4 w-4" /></button>
          </form>
          <SideBox title={t('Lĩnh vực', 'Field')}>
            <FacetButton active={!fieldId} onClick={() => set({ fieldId: null })} label={t('Tất cả lĩnh vực', 'All fields')} />
            {(fields.data ?? []).map((f) => <FacetButton key={f.id} active={fieldId === f.id} onClick={() => set({ fieldId: f.id })} label={lang === 'en' && f.nameEn ? f.nameEn : f.name} count={f.projectCount} testId={`button-field-${f.id}`} />)}
          </SideBox>
        </aside>
        <div>
          {list.isLoading ? <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div> : list.isError ? <ErrorState onRetry={() => list.refetch()} /> : !list.data?.items.length ? (
            <EmptyState icon={FlaskConical} title={t('Không có nhiệm vụ phù hợp', 'No matching projects')} hint={t('Điều chỉnh bộ lọc trạng thái hoặc lĩnh vực.', 'Adjust status or field filters.')} />
          ) : (
            <>
              <p className="meta mb-4 num">{fmtNum(list.data.total)} {t('nhiệm vụ', 'projects')}</p>
              <div className="grid gap-4 md:grid-cols-2">{list.data.items.map((pr) => <ProjectCard key={pr.id} p={pr} />)}</div>
              <Pagination page={page} totalPages={list.data.totalPages} onPage={(n) => set({ page: n }, false)} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = usePortal();
  const q = useGetProject(slug, { query: { enabled: !!slug, queryKey: getGetProjectQueryKey(slug) } });
  const p = q.data?.project;
  useSeo(p?.title ?? null, p?.summary ?? null);
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !q.data || !p) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;
  const d = q.data;
  const facts: [string, string][] = [
    [t('Mã số', 'Code'), p.code], [t('Loại hình', 'Type'), p.type], [t('Cấp quản lý', 'Level'), p.level],
    [t('Chủ nhiệm', 'Lead'), p.leadName], [t('Đơn vị chủ trì', 'Lead unit'), p.leadUnit],
    [t('Thời gian', 'Period'), `${p.startYear} – ${p.endYear ?? '…'}`], ...(p.budget ? [[t('Kinh phí', 'Budget'), p.budget] as [string, string]] : []),
    ...(p.fieldName ? [[t('Lĩnh vực', 'Field'), p.fieldName] as [string, string]] : []),
  ];
  return (
    <>
      <PageHeader title={p.title} kicker={`${p.code} · ${PROJECT_STATUS_LABEL[p.status]?.[lang === 'en' ? 1 : 0]}`} description={p.summary} crumbs={[{ label: t('Nghiên cứu', 'Research'), href: '/nghien-cuu' }, { label: p.code }]} />
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          {p.objectives.length > 0 && (
            <section><SectionHead title={t('Mục tiêu', 'Objectives')} />
              <ol className="space-y-3">{p.objectives.map((o, i) => <li key={i} className="flex gap-4 border-b border-rule pb-3 last:border-0"><span className="num text-lg text-seal">{String(i + 1).padStart(2, '0')}</span><span className="leading-relaxed">{o}</span></li>)}</ol>
            </section>
          )}
          {p.milestones.length > 0 && (
            <section><SectionHead title={t('Tiến độ thực hiện', 'Milestones')} />
              <ol className="relative ml-2 border-l-2 border-rule">
                {p.milestones.map((m, i) => (
                  <li key={i} className="relative pb-5 pl-6 last:pb-0">
                    <span className={cn('absolute -left-[9px] top-0.5 grid h-4 w-4 place-items-center rounded-full border-2', m.done ? 'border-navy bg-navy text-white' : 'border-rule bg-card')}>{m.done ? <Check className="h-2.5 w-2.5" /> : <Circle className="h-1.5 w-1.5 text-muted-foreground" />}</span>
                    <div className="num text-xs font-medium text-navy">{fmtDate(m.date)}</div>
                    <div className={cn('text-sm', m.done ? 'text-ink' : 'text-muted-foreground')}>{m.title}</div>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {p.results && <section><SectionHead title={t('Kết quả', 'Results')} /><div className="prose-portal" dangerouslySetInnerHTML={{ __html: p.results }} /></section>}
          {d.publications.length > 0 && <section><SectionHead title={t('Công bố từ nhiệm vụ', 'Publications')} /><div className="divide-y divide-rule">{d.publications.map((x) => <PublicationRow key={x.id} p={x} />)}</div></section>}
          {d.related.length > 0 && <section><SectionHead title={t('Nhiệm vụ liên quan', 'Related projects')} /><div className="grid gap-4 md:grid-cols-2">{d.related.slice(0, 4).map((r) => <ProjectCard key={r.id} p={r} />)}</div></section>}
        </div>
        <aside className="space-y-6">
          <SideBox title={t('Thông tin nhiệm vụ', 'Project facts')}>
            <dl className="divide-y divide-rule text-sm">{facts.map(([k, v]) => <div key={k} className="grid grid-cols-[110px_1fr] gap-2 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}</dl>
          </SideBox>
          {p.partners.length > 0 && <SideBox title={t('Đơn vị phối hợp', 'Partners')}><ul className="space-y-1.5 text-sm">{p.partners.map((x, i) => <li key={i} className="flex gap-2"><Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy" />{x}</li>)}</ul></SideBox>}
          {d.documents.length > 0 && <SideBox title={t('Văn bản', 'Documents')}><ul className="divide-y divide-rule text-sm">{d.documents.map((doc) => <li key={doc.id} className="py-2"><Link href={`/van-ban/${doc.id}`} className="flex gap-2 hover:text-navy"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-seal" /><span><span className="num block text-xs text-navy">{doc.number}</span>{doc.title}</span></Link></li>)}</ul></SideBox>}
          {p.keywords.length > 0 && <div className="flex flex-wrap gap-1.5">{p.keywords.map((k) => <Tag key={k} tone="muted">{k}</Tag>)}</div>}
        </aside>
      </div>
    </>
  );
}

/* ================= Publications ================= */
export function PublicationRow({ p }: { p: Publication }) {
  const { lang, t } = usePortal();
  const [open, setOpen] = useState(false);
  return (
    <article className="grid gap-4 py-4 sm:grid-cols-[60px_1fr]" data-testid={`row-publication-${p.id}`}>
      <div className="num text-xl font-medium text-navy">{p.year}</div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag tone="muted">{PUB_TYPE_LABEL[p.type]?.[lang === 'en' ? 1 : 0]}</Tag>
          {p.indexing && <Tag tone="gold">{p.indexing}</Tag>}
          {p.isInternational && <Tag>{t('Quốc tế', 'International')}</Tag>}
        </div>
        <h3 className="mt-2 font-display text-[1.02rem] font-semibold leading-snug text-ink">{p.title}</h3>
        <p className="mt-1 text-sm text-foreground/80">{p.authors}</p>
        <p className="text-sm italic text-muted-foreground">{p.venue}</p>
        <div className="meta mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="num inline-flex items-center gap-1 text-navy hover:underline" data-testid={`link-doi-${p.id}`}>DOI: {p.doi}<ExternalLink className="h-3 w-3" /></a>}
          {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy hover:underline">{t('Toàn văn', 'Full text')}<ExternalLink className="h-3 w-3" /></a>}
          <span className="inline-flex items-center gap-1 num"><Quote className="h-3 w-3" />{p.citationCount} {t('trích dẫn', 'citations')}</span>
          {p.projectSlug && <Link href={`/nghien-cuu/${p.projectSlug}`} className="hover:text-navy">{t('Thuộc', 'From')}: {p.projectTitle}</Link>}
          <button onClick={() => setOpen((o) => !o)} className="font-semibold text-seal hover:underline" data-testid={`button-abstract-${p.id}`}>{open ? t('Ẩn tóm tắt', 'Hide abstract') : t('Tóm tắt', 'Abstract')}</button>
        </div>
        {open && <p className="mt-3 border-l-2 border-rule pl-3 text-sm leading-relaxed text-muted-foreground">{p.abstract}</p>}
      </div>
    </article>
  );
}

export function PublicationsPage() {
  const { lang, t } = usePortal();
  const title = t('Công bố khoa học', 'Scientific publications');
  useSeo(title, null);
  const { params, set } = useQS();
  const page = Number(params.get('page') ?? 1) || 1;
  const type = (params.get('type') ?? undefined) as PublicationType | undefined;
  const year = params.get('year') ? Number(params.get('year')) : undefined;
  const fieldId = params.get('fieldId') ? Number(params.get('fieldId')) : undefined;
  const qq = params.get('q') ?? undefined;
  const p = { page, pageSize: 15, type, year, fieldId, q: qq };
  const list = useListPublications(p, { query: { queryKey: getListPublicationsQueryKey(p) } });
  const fields = useListFields();
  const [term, setTerm] = useState(qq ?? '');
  const d = list.data;
  return (
    <>
      <PageHeader title={title} kicker={t('Kết quả nghiên cứu', 'Research output')} crumbs={[{ label: title }]} description={t('Bài báo, báo cáo hội nghị, sách chuyên khảo và sáng chế của cán bộ nghiên cứu Viện.', 'Articles, conference papers, books and patents by Institute researchers.')} />
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); set({ q: term }); }} className="flex border border-rule bg-card focus-within:border-navy">
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('Tiêu đề, tác giả…', 'Title, author…')} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" data-testid="input-publication-search" />
            <button className="grid w-10 place-items-center bg-navy text-white" aria-label={t('Tìm', 'Search')}><Search className="h-4 w-4" /></button>
          </form>
          <SideBox title={t('Loại công bố', 'Type')}>
            <FacetButton active={!type} onClick={() => set({ type: null })} label={t('Tất cả', 'All')} />
            {(d?.typeCounts ?? []).map((c) => <FacetButton key={c.status} active={type === c.status} onClick={() => set({ type: c.status })} label={PUB_TYPE_LABEL[c.status]?.[lang === 'en' ? 1 : 0] ?? c.status} count={c.count} testId={`button-type-${c.status}`} />)}
          </SideBox>
          <SideBox title={t('Năm', 'Year')}>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => set({ year: null })} className={cn('border px-2 py-1 text-xs', !year ? 'border-navy bg-navy text-white' : 'border-rule hover:border-navy')}>{t('Tất cả', 'All')}</button>
              {(d?.years ?? []).map((y) => <button key={y} onClick={() => set({ year: y })} className={cn('num border px-2 py-1 text-xs', year === y ? 'border-navy bg-navy text-white' : 'border-rule hover:border-navy')} data-testid={`button-year-${y}`}>{y}</button>)}
            </div>
          </SideBox>
          <SideBox title={t('Lĩnh vực', 'Field')}>
            <FacetButton active={!fieldId} onClick={() => set({ fieldId: null })} label={t('Tất cả', 'All')} />
            {(fields.data ?? []).map((f) => <FacetButton key={f.id} active={fieldId === f.id} onClick={() => set({ fieldId: f.id })} label={f.shortName || f.name} count={f.publicationCount} />)}
          </SideBox>
        </aside>
        <div>
          {list.isLoading ? <ListSkeleton withImage={false} rows={6} /> : list.isError ? <ErrorState onRetry={() => list.refetch()} /> : !d?.items.length ? (
            <EmptyState icon={BookOpen} title={t('Không có công bố phù hợp', 'No matching publications')} />
          ) : (
            <>
              <p className="meta mb-2 num">{fmtNum(d.total)} {t('công bố', 'publications')}</p>
              <div className="divide-y divide-rule border-y border-rule">{d.items.map((x) => <PublicationRow key={x.id} p={x} />)}</div>
              <Pagination page={page} totalPages={d.totalPages} onPage={(n) => set({ page: n }, false)} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
