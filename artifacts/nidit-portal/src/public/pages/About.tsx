import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Building2, Clock, Mail, MapPin, Phone, Users, Briefcase, FlaskConical, Landmark } from 'lucide-react';
import { useGetStaticPage, getGetStaticPageQueryKey, useListOrgUnits, useListLeaders, useGetSiteSettings, ApiError, type OrgUnit } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fmtDate, usePortal, useSeo } from '../lib';
import { EmptyState, ErrorState, InquiryForm, Monogram, PageHeader, SideBox } from '../ui';
import NotFoundPage from './NotFound';

function AboutNav() {
  const [loc] = useLocation();
  const { t } = usePortal();
  const items = [
    { href: '/gioi-thieu', l: t('Giới thiệu chung', 'Overview') },
    { href: '/gioi-thieu/chuc-nang-nhiem-vu', l: t('Chức năng, nhiệm vụ', 'Mandate') },
    { href: '/gioi-thieu/co-cau-to-chuc', l: t('Cơ cấu tổ chức', 'Organisation') },
    { href: '/gioi-thieu/lanh-dao', l: t('Lãnh đạo Viện', 'Leadership') },
    { href: '/lien-he', l: t('Liên hệ', 'Contact') },
  ];
  return (
    <nav aria-label={t('Giới thiệu', 'About')} className="border border-rule bg-card">
      <div className="border-b border-rule bg-navy px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white">{t('Giới thiệu', 'About us')}</div>
      <ul>
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className={cn('block border-b border-l-[3px] border-b-rule px-4 py-2.5 text-sm last:border-b-0', loc === i.href ? 'border-l-seal bg-secondary/70 font-semibold text-ink' : 'border-l-transparent hover:bg-muted')} data-testid={`link-about-${i.href}`}>{i.l}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AboutShell({ title, children, description }: { title: string; children: ReactNode; description?: string | null }) {
  const { t } = usePortal();
  return (
    <>
      <PageHeader title={title} description={description} kicker={t('Giới thiệu', 'About')} crumbs={[{ label: t('Giới thiệu', 'About'), href: '/gioi-thieu' }, { label: title }]} />
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-16 lg:self-start"><AboutNav /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}

function StaticBody({ slug, fallbackTitle, withNav }: { slug: string; fallbackTitle: string; withNav: boolean }) {
  const { lang, t } = usePortal();
  const q = useGetStaticPage(slug, { query: { enabled: !!slug, queryKey: getGetStaticPageQueryKey(slug) } });
  const p = q.data;
  const title = p ? (lang === 'en' && p.titleEn ? p.titleEn : p.title) : fallbackTitle;
  useSeo(p ? p.seoTitle || title : fallbackTitle, p ? p.seoDescription || p.summary : null);
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  const body = q.isLoading ? (
    <div className="space-y-3">{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className={cn('h-4', i % 3 === 2 ? 'w-2/3' : 'w-full')} />)}</div>
  ) : q.isError || !p ? <ErrorState onRetry={() => q.refetch()} /> : (
    <article>
      <div className="prose-portal max-w-3xl" dangerouslySetInnerHTML={{ __html: lang === 'en' && p.contentEn ? p.contentEn : p.content }} />
      <p className="meta mt-8 border-t border-rule pt-3">{t('Cập nhật lần cuối', 'Last updated')}: <span className="num">{fmtDate(p.updatedAt)}</span>{p.updatedByName ? ` · ${p.updatedByName}` : ''}</p>
    </article>
  );
  if (withNav) return <AboutShell title={title} description={p?.summary}>{body}</AboutShell>;
  return (
    <>
      <PageHeader title={title} description={p?.summary} crumbs={[{ label: title }]} />
      <div className="container-portal py-8">{body}</div>
    </>
  );
}

export function IntroPage() {
  const { t } = usePortal();
  return <StaticBody slug="gioi-thieu" fallbackTitle={t('Giới thiệu chung', 'Overview')} withNav />;
}
export function MandatePage() {
  const { t } = usePortal();
  return <StaticBody slug="chuc-nang-nhiem-vu" fallbackTitle={t('Chức năng, nhiệm vụ', 'Mandate')} withNav />;
}
export function StaticPageRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <StaticBody slug={slug} fallbackTitle="" withNav={false} />;
}

const ORG_TYPES: { type: OrgUnit['type']; vi: string; en: string; icon: typeof Users }[] = [
  { type: 'council', vi: 'Hội đồng', en: 'Councils', icon: Landmark },
  { type: 'office', vi: 'Khối văn phòng', en: 'Offices', icon: Briefcase },
  { type: 'department', vi: 'Các ban, phòng chuyên môn', en: 'Departments', icon: Building2 },
  { type: 'center', vi: 'Các trung tâm', en: 'Centres', icon: FlaskConical },
];

export function OrgPage() {
  const { lang, t } = usePortal();
  const title = t('Cơ cấu tổ chức', 'Organisation structure');
  useSeo(title, null);
  const units = useListOrgUnits();
  const leaders = useListLeaders();
  const leadership = [...(leaders.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const director = leadership[0];
  const deputyDirectors = leadership.slice(1, 3);
  const leadershipCard = 'flex w-full flex-col items-center justify-center border-2 border-navy bg-navy text-center text-white';
  return (
    <AboutShell title={title}>
      {units.isLoading ? <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-40" /></div> : units.isError ? <ErrorState onRetry={() => units.refetch()} /> : (
        <div className="space-y-10">
          {/* Sơ đồ lãnh đạo */}
          <div className="flex flex-col items-center">
            <div className={cn(leadershipCard, 'min-h-[104px] max-w-3xl px-3 py-4 sm:min-h-[116px] sm:px-5 sm:py-5')}>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-gold sm:text-[0.72rem] sm:tracking-[0.12em]">{t('Lãnh đạo Viện', 'Leadership')}</div>
              <div className="mt-1.5 font-display text-[0.94rem] font-semibold leading-snug sm:mt-2 sm:text-[1.18rem]">
                {director ? `${director.position}: ${director.fullName}` : t('Viện trưởng', 'Director')}
              </div>
            </div>

            {deputyDirectors.length > 0 && (
              <div className="w-full max-w-3xl">
                <div className="mx-auto h-5 w-px bg-navy sm:h-7" />
                <div className="relative h-5 sm:h-7">
                  <div className="absolute left-1/4 right-1/4 top-0 h-px bg-navy" />
                  <div className="absolute left-1/4 top-0 h-5 w-px bg-navy sm:h-7" />
                  <div className="absolute right-1/4 top-0 h-5 w-px bg-navy sm:h-7" />
                </div>
                <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4">
                  {deputyDirectors.map((leader) => (
                    <div key={leader.id} className={cn(leadershipCard, 'min-h-[112px] px-2 py-3 sm:min-h-[116px] sm:px-5 sm:py-5')}>
                      <div className="text-[0.56rem] font-semibold uppercase leading-tight tracking-[0.08em] text-gold sm:text-[0.72rem] sm:tracking-[0.12em]">{leader.position}</div>
                      <div className="mt-2 font-display text-[0.82rem] font-semibold leading-[1.18] sm:text-[1.18rem] sm:leading-snug">{leader.fullName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {ORG_TYPES.map((g) => {
            const list = (units.data ?? []).filter((u) => u.type === g.type).sort((a, b) => a.sortOrder - b.sortOrder);
            if (!list.length) return null;
            return (
              <section key={g.type}>
                <h2 className="mb-4 flex items-center gap-2 border-b-2 border-ink pb-1.5 text-sm font-bold uppercase tracking-[0.06em] text-ink"><g.icon className="h-4 w-4 text-seal" />{lang === 'en' ? g.en : g.vi}<span className="num ml-auto text-xs font-medium text-muted-foreground">{list.length}</span></h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {list.map((u) => (
                    <article key={u.id} className="border border-rule border-t-[3px] border-t-navy bg-card p-5" data-testid={`card-org-${u.id}`}>
                      <h3 className="font-display text-[1.05rem] font-semibold text-ink">{lang === 'en' && u.nameEn ? u.nameEn : u.name}</h3>
                      {u.headName && <p className="mt-1 text-sm"><span className="text-muted-foreground">{u.headTitle ?? t('Phụ trách', 'Head')}:</span> <strong>{u.headName}</strong></p>}
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.description}</p>
                      {u.tasks.length > 0 && <ul className="mt-3 space-y-1 text-sm">{u.tasks.slice(0, 4).map((tk, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 bg-seal" />{tk}</li>)}</ul>}
                      {(u.email || u.phone) && (
                        <div className="meta mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-rule pt-2.5">
                          {u.email && <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1 hover:text-navy"><Mail className="h-3 w-3" />{u.email}</a>}
                          {u.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</span>}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AboutShell>
  );
}

export function LeadersPage() {
  const { t } = usePortal();
  const title = t('Lãnh đạo Viện', 'Leadership');
  useSeo(title, null);
  const q = useListLeaders();
  const list = [...(q.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <AboutShell title={title}>
      {q.isLoading ? <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : list.length === 0 ? <EmptyState icon={Users} title={t('Chưa cập nhật thông tin lãnh đạo', 'No leadership data yet')} /> : (
        <div className="space-y-5">
          {list.map((l, i) => (
            <article key={l.id} className={cn('grid gap-5 border border-rule bg-card p-5 sm:grid-cols-[150px_1fr]', i === 0 && 'border-t-[3px] border-t-seal')} data-testid={`card-leader-${l.id}`}>
              {l.photoUrl ? <img src={l.photoUrl} alt={l.fullName} className="aspect-[3/4] w-full object-cover" /> : <Monogram name={l.fullName} className="aspect-[3/4] w-full max-w-[150px]" />}
              <div>
                <div className="kicker">{l.position}</div>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">{l.fullName}</h2>
                {l.bio && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.bio}</p>}
                {l.responsibilities.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink">{t('Lĩnh vực phụ trách', 'Responsibilities')}</div>
                    <ul className="mt-1.5 space-y-1 text-sm">{l.responsibilities.map((r, k) => <li key={k} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 bg-seal" />{r}</li>)}</ul>
                  </div>
                )}
                <div className="meta mt-3 flex flex-wrap gap-4">
                  {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 hover:text-navy"><Mail className="h-3 w-3" />{l.email}</a>}
                  {l.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AboutShell>
  );
}

export function ContactPage() {
  const { lang, t } = usePortal();
  const title = t('Liên hệ', 'Contact');
  useSeo(title, null);
  const { data: s, isLoading } = useGetSiteSettings();
  return (
    <AboutShell title={title} description={t('Gửi câu hỏi, góp ý hoặc đề nghị hợp tác tới Viện. Mỗi yêu cầu được cấp mã tiếp nhận để theo dõi.', 'Send questions, feedback or partnership proposals. Each request receives a tracking code.')}>
      <div className="grid gap-8 xl:grid-cols-[1fr_1.15fr]">
        <div className="space-y-5">
          <SideBox title={lang === 'en' ? s?.siteNameEn ?? '' : s?.siteName ?? ''}>
            {isLoading ? <Skeleton className="h-32" /> : (
              <ul className="space-y-3 p-1 text-sm">
                <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-seal" />{lang === 'en' ? s?.addressEn : s?.address}</li>
                <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-seal" /><a href={`tel:${s?.phone}`} className="hover:text-navy">{s?.phone}</a></li>
                <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-seal" /><a href={`mailto:${s?.email}`} className="hover:text-navy">{s?.email}</a></li>
                <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-seal" />{s?.workingHours}</li>
              </ul>
            )}
          </SideBox>
          <div className="aspect-[4/3] overflow-hidden border border-rule bg-muted">
            {s?.mapEmbedUrl ? <iframe src={s.mapEmbedUrl} title={t('Bản đồ', 'Map')} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="img-fallback grid h-full place-items-center text-white/70"><MapPin className="h-8 w-8" /></div>}
          </div>
        </div>
        <section className="border border-rule bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-ink">{t('Gửi thông tin liên hệ', 'Send a message')}</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">{t('Các trường có dấu * là bắt buộc.', 'Fields marked * are required.')}</p>
          <InquiryForm type="contact" />
        </section>
      </div>
    </AboutShell>
  );
}
