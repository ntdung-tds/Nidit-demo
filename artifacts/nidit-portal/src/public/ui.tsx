import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  AlertTriangle, ChevronLeft, ChevronRight, Clock, Eye, FileSearch, RotateCw, CheckCircle2,
  Cpu, Database, ShieldCheck, Network, Building2, GraduationCap, Brain, Globe, Layers, Server, Lock, BarChart3, FlaskConical, Landmark,
  type LucideIcon,
} from 'lucide-react';
import { useCreateInquiry, type ArticleSummary, type InquiryType, type InquiryReceipt } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { asset, fmtDate, fmtNum, isExternal, usePortal } from './lib';

/* ---------- Image with designed fallback ---------- */
export function Img({ src, alt, className, label, ratio = 'aspect-[16/10]' }: { src?: string | null; alt: string; className?: string; label?: string; ratio?: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-muted', ratio, className)}>
      {src && !err ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
      ) : (
        <div className="img-fallback absolute inset-0 flex items-end" role="img" aria-label={alt}>
          <div className="dot-grid absolute inset-0" />
          <img src={asset('logo-nidit.svg')} alt="" aria-hidden className="absolute right-3 top-3 h-7 w-7 opacity-60" />
          <span className="relative m-3 line-clamp-2 font-display text-sm text-white/85">{label ?? 'NIDIT'}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Smart link ---------- */
export function SmartLink({ href, newTab, className, children, testId, onClick }: { href: string; newTab?: boolean; className?: string; children: ReactNode; testId?: string; onClick?: () => void }) {
  if (isExternal(href) || newTab) {
    return (
      <a href={href} target={newTab || isExternal(href) ? '_blank' : undefined} rel="noopener noreferrer" className={className} data-testid={testId} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} data-testid={testId} onClick={onClick}>
      {children}
    </Link>
  );
}

/* ---------- Section heading (newsroom rule) ---------- */
export function SectionHead({ title, href, more, className, as = 'h2' }: { title: string; href?: string; more?: string; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const { t } = usePortal();
  const H = as;
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-3 border-b-2 border-ink', className)}>
      <H className="relative -mb-[2px] border-b-2 border-seal pb-1.5 text-[0.95rem] font-bold uppercase tracking-[0.06em] text-ink">
        {href ? <Link href={href} className="hover:text-seal">{title}</Link> : title}
      </H>
      {href && (
        <Link href={href} className="mb-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-seal" data-testid={`link-more-${href}`}>
          {more ?? t('Xem thêm', 'More')} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ title, kicker, description, crumbs, children }: { title: string; kicker?: string; description?: string | null; crumbs?: { label: string; href?: string }[]; children?: ReactNode }) {
  return (
    <div className="paper-grain border-b border-rule bg-paper">
      <div className="container-portal py-6 md:py-9">
        {crumbs && <Breadcrumb items={crumbs} />}
        {kicker && <div className="kicker mt-4">{kicker}</div>}
        <h1 className="mt-2 max-w-4xl font-display text-[1.75rem] font-semibold leading-tight text-ink md:text-[2.4rem]">{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-muted-foreground">{description}</p>}
        {children}
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const { t } = usePortal();
  return (
    <nav aria-label={t('Đường dẫn', 'Breadcrumb')} className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/" className="hover:text-seal">{t('Trang chủ', 'Home')}</Link></li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 opacity-60" />
            {c.href ? <Link href={c.href} className="hover:text-seal">{c.label}</Link> : <span aria-current="page" className="text-foreground/80">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------- States ---------- */
export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = usePortal();
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center" role="alert">
      <AlertTriangle className="h-7 w-7 text-destructive" />
      <p className="font-medium">{message ?? t('Không tải được dữ liệu.', 'Could not load data.')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry">
          <RotateCw className="mr-1.5 h-3.5 w-3.5" />{t('Thử lại', 'Retry')}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, icon: Icon = FileSearch, action }: { title: string; hint?: string; icon?: LucideIcon; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border border-rule bg-paper px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-rule bg-card">
        <Icon className="h-6 w-6 text-navy" />
      </div>
      <p className="font-display text-lg text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-md text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 5, withImage = true }: { rows?: number; withImage?: boolean }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {withImage && <Skeleton className="aspect-[16/10] w-40 shrink-0 rounded-none md:w-56" />}
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div>
      <div className="border-b border-rule bg-paper"><div className="container-portal space-y-3 py-9"><Skeleton className="h-3 w-40" /><Skeleton className="h-9 w-2/3" /><Skeleton className="h-4 w-1/2" /></div></div>
      <div className="container-portal grid gap-8 py-8 lg:grid-cols-[1fr_300px]"><ListSkeleton /><div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-28" /></div></div>
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const { t } = usePortal();
  if (totalPages <= 1) return null;
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  const btn = 'grid h-9 min-w-9 place-items-center border border-rule px-2 text-sm transition-colors hover:border-navy hover:text-navy disabled:pointer-events-none disabled:opacity-40';
  return (
    <nav aria-label={t('Phân trang', 'Pagination')} className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <button className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t('Trang trước', 'Previous')} data-testid="button-page-prev"><ChevronLeft className="h-4 w-4" /></button>
      {pages.map((p, i) =>
        p === '…' ? <span key={i} className="px-1 text-muted-foreground">…</span> : (
          <button key={i} className={cn(btn, 'num', p === page && 'border-navy bg-navy text-primary-foreground hover:text-primary-foreground')} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)} data-testid={`button-page-${p}`}>{p}</button>
        ),
      )}
      <button className={btn} disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label={t('Trang sau', 'Next')} data-testid="button-page-next"><ChevronRight className="h-4 w-4" /></button>
    </nav>
  );
}

/* ---------- Article pieces ---------- */
export function ArticleMeta({ a, className }: { a: ArticleSummary; className?: string }) {
  return (
    <div className={cn('meta flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {a.publishedAt && <span className="num">{fmtDate(a.publishedAt)}</span>}
      {a.sourceName && <span>{a.sourceName}</span>}
      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{a.readingMinutes}′</span>
      <span className="inline-flex items-center gap-1 num"><Eye className="h-3 w-3" />{fmtNum(a.viewCount)}</span>
    </div>
  );
}

export function ArticleRow({ a, showSummary = true, imgWidth = 'w-36 md:w-56' }: { a: ArticleSummary; showSummary?: boolean; imgWidth?: string }) {
  return (
    <article className="group flex gap-4 border-b border-rule pb-5 last:border-0" data-testid={`card-article-${a.id}`}>
      <Link href={`/tin-tuc/${a.slug}`} className={cn('shrink-0', imgWidth)} tabIndex={-1} aria-hidden>
        <Img src={a.coverImage} alt={a.title} label={a.categoryName ?? undefined} />
      </Link>
      <div className="min-w-0 flex-1">
        {a.categoryName && a.categorySlug && <Link href={`/tin-tuc/chuyen-muc/${a.categorySlug}`} className="kicker hover:underline">{a.categoryName}</Link>}
        <h3 className="mt-1 font-display text-[1.05rem] font-semibold leading-snug text-ink md:text-[1.15rem]">
          <Link href={`/tin-tuc/${a.slug}`} className="headline-link">{a.title}</Link>
        </h3>
        {showSummary && <p className="mt-1.5 line-clamp-2 hidden text-sm leading-relaxed text-muted-foreground sm:block">{a.summary}</p>}
        <ArticleMeta a={a} className="mt-2" />
      </div>
    </article>
  );
}

export function ArticleCard({ a, size = 'md' }: { a: ArticleSummary; size?: 'sm' | 'md' }) {
  return (
    <article className="group" data-testid={`card-article-${a.id}`}>
      <Link href={`/tin-tuc/${a.slug}`} tabIndex={-1} aria-hidden><Img src={a.coverImage} alt={a.title} label={a.categoryName ?? undefined} /></Link>
      <h3 className={cn('mt-2.5 font-display font-semibold leading-snug text-ink', size === 'sm' ? 'text-[0.98rem]' : 'text-[1.1rem]')}>
        <Link href={`/tin-tuc/${a.slug}`} className="headline-link">{a.title}</Link>
      </h3>
      <div className="meta mt-1.5 num">{fmtDate(a.publishedAt)}</div>
    </article>
  );
}

/* ---------- Icon map ---------- */
const ICONS: Record<string, LucideIcon> = {
  cpu: Cpu, database: Database, 'shield-check': ShieldCheck, network: Network, 'building-2': Building2,
  'graduation-cap': GraduationCap, brain: Brain, globe: Globe, layers: Layers, server: Server, lock: Lock,
  'bar-chart-3': BarChart3, 'flask-conical': FlaskConical, landmark: Landmark,
};
export function FieldIcon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] ?? Layers;
  return <I className={className} aria-hidden />;
}

/* ---------- Monogram ---------- */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[parts.length - 2]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
  return (
    <div className={cn('img-fallback relative grid place-items-center overflow-hidden', className)} aria-hidden>
      <div className="dot-grid absolute inset-0" />
      <div className="absolute inset-3 rounded-full border border-gold/50" />
      <span className="relative font-display text-3xl font-semibold tracking-wide text-white">{initials}</span>
    </div>
  );
}

/* ---------- Inquiry form ---------- */
export function InquiryForm({ type, datasetId, serviceId, subjectDefault, compact }: { type: InquiryType; datasetId?: number; serviceId?: number; subjectDefault?: string; compact?: boolean }) {
  const { t } = usePortal();
  const create = useCreateInquiry();
  const [receipt, setReceipt] = useState<InquiryReceipt | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', organization: '', subject: subjectDefault ?? '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const upd = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.fullName.trim()) er.fullName = t('Vui lòng nhập họ tên', 'Name is required');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = t('Email không hợp lệ', 'Invalid email');
    if (form.message.trim().length < 10) er.message = t('Nội dung tối thiểu 10 ký tự', 'At least 10 characters');
    setErrors(er);
    if (Object.keys(er).length) return;
    create.mutate(
      {
        data: {
          type, fullName: form.fullName.trim(), email: form.email.trim(),
          phone: form.phone || null, organization: form.organization || null, subject: form.subject || null,
          message: form.message.trim(), datasetId: datasetId ?? null, serviceId: serviceId ?? null,
        },
      },
      { onSuccess: (r) => setReceipt(r) },
    );
  };

  if (receipt) {
    return (
      <div className="border border-navy/30 bg-secondary/60 p-6" role="status" data-testid="status-inquiry-receipt">
        <CheckCircle2 className="h-7 w-7 text-navy" />
        <p className="mt-3 font-display text-lg text-ink">{t('Đã tiếp nhận yêu cầu', 'Request received')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{receipt.message}</p>
        <div className="mt-4 inline-flex items-baseline gap-2 border border-dashed border-navy/40 bg-card px-4 py-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{t('Mã tiếp nhận', 'Receipt code')}</span>
          <span className="num text-lg font-semibold text-navy" data-testid="text-receipt-code">{receipt.code}</span>
        </div>
        <p className="meta mt-2">{fmtDate(receipt.createdAt)}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => { setReceipt(null); setForm((f) => ({ ...f, message: '' })); }} data-testid="button-inquiry-new">
          {t('Gửi yêu cầu khác', 'Send another')}
        </Button>
      </div>
    );
  }

  const field = (k: keyof typeof form, label: string, opts: { required?: boolean; type?: string } = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`inq-${k}`} className="text-xs font-semibold">{label}{opts.required && <span className="text-seal"> *</span>}</Label>
      <Input id={`inq-${k}`} type={opts.type ?? 'text'} value={form[k]} onChange={upd(k)} aria-invalid={!!errors[k]} className="rounded-sm bg-card" data-testid={`input-${k}`} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        {field('fullName', t('Họ và tên', 'Full name'), { required: true })}
        {field('email', 'Email', { required: true, type: 'email' })}
        {field('phone', t('Điện thoại', 'Phone'))}
        {field('organization', t('Cơ quan, đơn vị', 'Organisation'))}
      </div>
      {field('subject', t('Tiêu đề', 'Subject'))}
      <div className="space-y-1.5">
        <Label htmlFor="inq-message" className="text-xs font-semibold">{t('Nội dung', 'Message')}<span className="text-seal"> *</span></Label>
        <Textarea id="inq-message" rows={5} value={form.message} onChange={upd('message')} aria-invalid={!!errors.message} className="rounded-sm bg-card" data-testid="input-message" />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>
      {create.isError && <p className="text-sm text-destructive">{t('Gửi không thành công, vui lòng thử lại.', 'Submission failed, please retry.')}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={create.isPending} className="rounded-sm" data-testid="button-inquiry-submit">
          {create.isPending ? t('Đang gửi…', 'Sending…') : t('Gửi yêu cầu', 'Submit')}
        </Button>
        <span className="meta">{t('Thông tin được bảo mật theo chính sách của Viện.', 'Your data is handled under the Institute privacy policy.')}</span>
      </div>
    </form>
  );
}

/* ---------- Facet sidebar button ---------- */
export function FacetButton({ active, onClick, label, count, testId }: { active: boolean; onClick: () => void; label: string; count?: number; testId?: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={cn('flex w-full items-center justify-between gap-2 border-l-2 px-3 py-1.5 text-left text-sm transition-colors', active ? 'border-seal bg-secondary/70 font-semibold text-ink' : 'border-transparent text-foreground/80 hover:border-rule hover:bg-muted/60')}
    >
      <span>{label}</span>
      {count !== undefined && <span className="num text-xs text-muted-foreground">{count}</span>}
    </button>
  );
}

export function SideBox({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('border border-rule bg-card', className)}>
      <h2 className="border-b border-rule bg-paper px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-ink">{title}</h2>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function Tag({ children, tone = 'navy' }: { children: ReactNode; tone?: 'navy' | 'seal' | 'gold' | 'muted' }) {
  const tones = {
    navy: 'border-navy/25 bg-secondary text-navy',
    seal: 'border-seal/30 bg-seal/8 text-seal',
    gold: 'border-gold/40 bg-gold/12 text-[hsl(32_70%_30%)]',
    muted: 'border-rule bg-muted text-muted-foreground',
  };
  return <span className={cn('inline-flex items-center border px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide', tones[tone])}>{children}</span>;
}
