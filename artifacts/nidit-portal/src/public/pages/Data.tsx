import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Cloud, Code2, Database, Download, Link2, Lock, Search, ShieldCheck, Clock, Mail, CheckCircle2, Users, FileCheck2 } from 'lucide-react';
import {
  useGetDatasetStats, useListDatasets, getListDatasetsQueryKey, useGetDataset, getGetDatasetQueryKey, useRecordDatasetAccess,
  useListEvaluationServices, useGetEvaluationService, getGetEvaluationServiceQueryKey, useListFields, ApiError,
  type AccessLevel, type AccessMethodType, type Dataset,
} from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ACCESS_LABEL, asset, fmtDate, fmtNum, useQS, usePortal, useSeo } from '../lib';
import { useToast } from '@/hooks/use-toast';
import { EmptyState, ErrorState, FacetButton, FieldIcon, InquiryForm, PageHeader, PageSkeleton, SectionHead, SideBox, Tag } from '../ui';
import NotFoundPage from './NotFound';

const accessTone = (a: string) => (a === 'open' ? 'navy' : a === 'registered' ? 'gold' : 'seal') as 'navy';
const METHOD_ICON: Record<AccessMethodType, typeof Link2> = { link: Download, api: Code2, object_storage: Cloud };

function DatasetCard({ d }: { d: Dataset }) {
  const { lang, t } = usePortal();
  return (
    <Link href={`/du-lieu-ai/${d.slug}`} className="group flex flex-col border border-rule bg-card p-5 transition-colors hover:border-navy/40" data-testid={`card-dataset-${d.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center bg-secondary text-navy"><Database className="h-5 w-5" /></div>
        <Tag tone={accessTone(d.accessLevel)}>{d.accessLevel !== 'open' && <Lock className="mr-1 h-2.5 w-2.5" />}{ACCESS_LABEL[d.accessLevel]?.[lang === 'en' ? 1 : 0]}</Tag>
      </div>
      <h3 className="mt-3 font-display text-[1.05rem] font-semibold leading-snug text-ink group-hover:text-navy">{d.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{d.summary}</p>
      {d.aiTasks.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{d.aiTasks.slice(0, 3).map((x) => <span key={x} className="border border-rule px-1.5 py-0.5 text-[0.68rem] text-foreground/70">{x}</span>)}</div>}
      <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-rule pt-3 text-xs">
        <div><dt className="text-muted-foreground">{t('Bản ghi', 'Records')}</dt><dd className="num font-medium text-ink">{fmtNum(d.recordCount)}</dd></div>
        <div><dt className="text-muted-foreground">{t('Dung lượng', 'Size')}</dt><dd className="num font-medium text-ink">{d.sizeLabel}</dd></div>
        <div><dt className="text-muted-foreground">{t('Định dạng', 'Format')}</dt><dd className="truncate font-medium text-ink">{d.formats.join(', ')}</dd></div>
      </dl>
    </Link>
  );
}

export function DatasetsPage() {
  const { lang, t } = usePortal();
  const title = t('Dữ liệu phục vụ AI', 'AI-ready datasets');
  useSeo(title, null);
  const { params, set } = useQS();
  const fieldId = params.get('fieldId') ? Number(params.get('fieldId')) : undefined;
  const accessLevel = (params.get('accessLevel') ?? undefined) as AccessLevel | undefined;
  const qq = params.get('q') ?? undefined;
  const p = { fieldId, accessLevel, q: qq };
  const list = useListDatasets(p, { query: { queryKey: getListDatasetsQueryKey(p) } });
  const stats = useGetDatasetStats();
  const fields = useListFields();
  const [term, setTerm] = useState(qq ?? '');
  const s = stats.data;
  return (
    <>
      <PageHeader title={title} kicker={t('Danh mục dữ liệu mở và dữ liệu dùng chung', 'Data catalogue')} crumbs={[{ label: title }]} description={t('Bộ dữ liệu đã chuẩn hóa, gán nhãn, sẵn sàng huấn luyện và đánh giá mô hình trí tuệ nhân tạo. Truy cập qua đường dẫn tải, API hoặc Object Storage.', 'Curated, labelled datasets ready for AI training and evaluation, available via download, API or object storage.')}>
        <dl className="mt-6 grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-4">
          {[[t('Bộ dữ liệu', 'Datasets'), s?.total], [t('Tổng bản ghi', 'Records'), s?.totalRecords], [t('Lượt truy cập', 'Accesses'), s?.totalDownloads], [t('Yêu cầu khai thác', 'Requests'), s?.totalRequests]].map(([k, v]) => (
            <div key={String(k)} className="bg-card px-4 py-3"><dd className="num text-2xl font-medium text-navy">{v === undefined ? <Skeleton className="h-7 w-16" /> : fmtNum(v as number)}</dd><dt className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt></div>
          ))}
        </dl>
      </PageHeader>
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); set({ q: term }); }} className="flex border border-rule bg-card focus-within:border-navy">
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('Tên, từ khóa, bài toán…', 'Name, keyword, task…')} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" data-testid="input-dataset-search" />
            <button className="grid w-10 place-items-center bg-navy text-white" aria-label={t('Tìm', 'Search')}><Search className="h-4 w-4" /></button>
          </form>
          <SideBox title={t('Mức truy cập', 'Access level')}>
            <FacetButton active={!accessLevel} onClick={() => set({ accessLevel: null })} label={t('Tất cả', 'All')} count={s?.total} />
            {(s?.byAccessLevel ?? []).map((a) => <FacetButton key={a.status} active={accessLevel === a.status} onClick={() => set({ accessLevel: a.status })} label={ACCESS_LABEL[a.status]?.[lang === 'en' ? 1 : 0] ?? a.status} count={a.count} testId={`button-access-${a.status}`} />)}
          </SideBox>
          <SideBox title={t('Lĩnh vực', 'Field')}>
            <FacetButton active={!fieldId} onClick={() => set({ fieldId: null })} label={t('Tất cả', 'All')} />
            {(fields.data ?? []).filter((f) => f.datasetCount > 0).map((f) => <FacetButton key={f.id} active={fieldId === f.id} onClick={() => set({ fieldId: f.id })} label={f.shortName || f.name} count={f.datasetCount} />)}
          </SideBox>
          {s && s.formats.length > 0 && (
            <SideBox title={t('Định dạng phổ biến', 'Formats')}>
              <ul className="space-y-1.5">{s.formats.slice(0, 6).map((f) => { const max = Math.max(...s.formats.map((x) => x.count)); return <li key={f.label} className="text-xs"><div className="flex justify-between"><span>{f.label}</span><span className="num">{f.count}</span></div><div className="mt-0.5 h-1 bg-muted"><div className="h-1 bg-navy" style={{ width: `${(f.count / max) * 100}%` }} /></div></li>; })}</ul>
            </SideBox>
          )}
          <Link href="/trang/huong-dan-khai-thac-du-lieu" className="block border border-dashed border-navy/40 p-3 text-sm text-navy hover:bg-secondary/60">{t('Hướng dẫn khai thác dữ liệu', 'Data usage guide')} →</Link>
        </aside>
        <div>
          {list.isLoading ? <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div> : list.isError ? <ErrorState onRetry={() => list.refetch()} /> : !list.data?.length ? (
            <EmptyState icon={Database} title={t('Không tìm thấy bộ dữ liệu', 'No datasets found')} hint={t('Thử từ khóa khác hoặc bỏ bộ lọc.', 'Try another keyword or clear filters.')} />
          ) : <div className="grid gap-4 md:grid-cols-2">{list.data.map((d) => <DatasetCard key={d.id} d={d} />)}</div>}
        </div>
      </div>
    </>
  );
}

export function DatasetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = usePortal();
  const q = useGetDataset(slug, { query: { enabled: !!slug, queryKey: getGetDatasetQueryKey(slug) } });
  const access = useRecordDatasetAccess();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const d = q.data?.dataset;
  useSeo(d?.title ?? null, d?.summary ?? null);
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !d) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;

  const openMethod = (m: { type: AccessMethodType; url: string }) => {
    if (d.accessLevel === 'restricted') {
      toast({
        title: t('Cần được phê duyệt trước khi khai thác', 'Approval required'),
        description: t('Vui lòng gửi yêu cầu khai thác dữ liệu ở biểu mẫu bên dưới.', 'Please submit a data access request using the form below.'),
      });
      document.getElementById('dang-ky')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (import.meta.env.VITE_GITHUB_PAGES === 'true') {
      if (d.accessLevel !== 'open') {
        toast({
          title: t('Yêu cầu truy cập đã tắt', 'Access requests are disabled'),
          description: t('Bản demo tĩnh không tiếp nhận hoặc lưu yêu cầu khai thác dữ liệu.', 'This static demo cannot accept or store data access requests.'),
        });
        document.getElementById('dang-ky')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (/^https?:\/\//i.test(m.url)) {
        window.open(m.url, '_blank', 'noopener');
      } else if (m.url.startsWith('/files/')) {
        window.open(asset(m.url), '_blank', 'noopener');
      } else {
        toast({
          title: t('Nguồn dữ liệu không có trong bản demo', 'Data source is not included in this demo'),
          description: t('Bản demo tĩnh chỉ hiển thị thông tin mô tả, không kết nối nguồn dữ liệu trực tiếp.', 'The static demo displays metadata only and does not connect to live data sources.'),
        });
      }
      return;
    }
    const storage = m.url.startsWith('s3://');
    setPending(m.type);
    // Mở sẵn cửa sổ trong lúc người dùng bấm để trình duyệt không chặn cửa sổ bật lên
    const w = storage ? null : window.open('', '_blank');
    if (w) w.opener = null;
    access.mutate({ id: d.id, data: { method: m.type } }, {
      onSuccess: (r) => {
        if (r.url.startsWith('s3://')) {
          void navigator.clipboard?.writeText(r.url).catch(() => undefined);
          toast({
            title: t('Đã sao chép địa chỉ kho lưu trữ', 'Storage address copied'),
            description: t(`${r.url} — thông tin xác thực được gửi qua email sau khi đăng ký hợp lệ.`, `${r.url} — credentials are emailed after a valid registration.`),
          });
          return;
        }
        const url = r.url.startsWith('/') ? asset(r.url) : r.url;
        if (w) w.location.href = url;
        else window.open(url, '_blank', 'noopener');
      },
      onError: (err) => {
        w?.close();
        const data = err instanceof ApiError ? (err.data as { error?: string } | null) : null;
        toast({
          variant: 'destructive',
          title: t('Không mở được dữ liệu', 'Could not open the data'),
          description: data?.error ?? t('Vui lòng thử lại sau.', 'Please try again later.'),
        });
      },
      onSettled: () => setPending(null),
    });
  };
  const meta: [string, string][] = [
    [t('Đơn vị công bố', 'Publisher'), d.publisher], [t('Giấy phép', 'Licence'), d.license], [t('Phiên bản', 'Version'), d.version],
    [t('Ngôn ngữ', 'Language'), d.language], [t('Tần suất cập nhật', 'Update frequency'), d.updateFrequency],
    [t('Ngày công bố', 'Issued'), fmtDate(d.issuedDate)], [t('Cập nhật', 'Updated'), fmtDate(d.updatedAt)],
    [t('Số bản ghi', 'Records'), fmtNum(d.recordCount)], [t('Dung lượng', 'Size'), d.sizeLabel], [t('Định dạng', 'Formats'), d.formats.join(', ')],
  ];
  return (
    <>
      <PageHeader title={d.title} kicker={d.fieldName ?? t('Bộ dữ liệu', 'Dataset')} description={d.summary} crumbs={[{ label: t('Dữ liệu AI', 'AI data'), href: '/du-lieu-ai' }, { label: d.title }]}>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag tone={accessTone(d.accessLevel)}>{ACCESS_LABEL[d.accessLevel]?.[lang === 'en' ? 1 : 0]}</Tag>
          <span className="meta num">{fmtNum(d.downloadCount)} {t('lượt truy cập', 'accesses')} · {fmtNum(d.requestCount)} {t('yêu cầu', 'requests')}</span>
        </div>
      </PageHeader>
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <div className="prose-portal" dangerouslySetInnerHTML={{ __html: d.description }} />
          {d.columns.length > 0 && (
            <section><SectionHead title={t('Cấu trúc dữ liệu', 'Schema')} />
              <div className="overflow-x-auto border border-rule">
                <table className="w-full text-sm">
                  <thead className="bg-paper text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2">{t('Trường', 'Column')}</th><th className="px-3 py-2">{t('Kiểu', 'Type')}</th><th className="px-3 py-2">{t('Mô tả', 'Description')}</th></tr></thead>
                  <tbody className="divide-y divide-rule bg-card">{d.columns.map((c) => <tr key={c.name}><td className="num px-3 py-2 font-medium text-navy">{c.name}</td><td className="num px-3 py-2 text-xs text-muted-foreground">{c.type}</td><td className="px-3 py-2">{c.description}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
          )}
          {d.conditions && <section><SectionHead title={t('Điều kiện truy cập, sử dụng', 'Terms of use')} /><div className="prose-portal border-l-4 border-gold bg-paper p-5 text-[0.95rem]" dangerouslySetInnerHTML={{ __html: d.conditions }} /></section>}
          {d.accessLevel !== 'open' && (
            <section id="dang-ky" className="border border-rule bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-ink">{t('Đăng ký khai thác dữ liệu', 'Request data access')}</h2>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">{d.accessLevel === 'restricted' ? t('Bộ dữ liệu hạn chế: cần nêu rõ mục đích sử dụng, đơn vị và cam kết bảo mật.', 'Restricted: state purpose, organisation and confidentiality commitment.') : t('Bộ dữ liệu yêu cầu đăng ký: Viện sẽ gửi thông tin truy cập qua email.', 'Registration required: credentials will be emailed.')}</p>
              <InquiryForm type="dataset_access" datasetId={d.id} subjectDefault={`${t('Đăng ký khai thác', 'Access request')}: ${d.title}`} />
            </section>
          )}
          {(q.data?.related ?? []).length > 0 && <section><SectionHead title={t('Bộ dữ liệu liên quan', 'Related datasets')} /><div className="grid gap-4 md:grid-cols-2">{q.data!.related.slice(0, 4).map((r) => <DatasetCard key={r.id} d={r} />)}</div></section>}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-16 lg:self-start">
          <SideBox title={t('Phương thức truy cập', 'Access methods')}>
            <ul className="space-y-2">
              {d.accessMethods.map((m, i) => {
                const I = METHOD_ICON[m.type] ?? Link2;
                return (
                  <li key={i}>
                    <button onClick={() => openMethod(m)} disabled={pending !== null} className="flex w-full items-start gap-3 border border-rule bg-paper p-3 text-left transition-colors hover:border-navy disabled:opacity-60" data-testid={`button-access-${m.type}`}>
                      <I className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                      <span className="min-w-0"><span className="block text-sm font-semibold text-ink">{pending === m.type ? t('Đang mở…', 'Opening…') : m.label}</span>{m.note && <span className="meta block">{m.note}</span>}<span className="num block truncate text-[0.68rem] text-muted-foreground">{m.url}</span></span>
                    </button>
                  </li>
                );
              })}
              {d.accessMethods.length === 0 && <li className="text-sm text-muted-foreground">{t('Chưa công bố phương thức truy cập.', 'No access methods published.')}</li>}
            </ul>
            {d.accessLevel !== 'open' && <a href="#dang-ky" className="mt-3 block bg-navy px-3 py-2 text-center text-sm font-semibold text-white hover:bg-navy-deep" data-testid="link-request-access">{t('Đăng ký khai thác', 'Request access')}</a>}
          </SideBox>
          <SideBox title={t('Thông tin mô tả', 'Metadata')}>
            <dl className="divide-y divide-rule text-sm">{meta.map(([k, v]) => <div key={k} className="grid grid-cols-[120px_1fr] gap-2 py-1.5"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}</dl>
            <a href={`mailto:${d.contactEmail}`} className="meta mt-2 inline-flex items-center gap-1 hover:text-navy"><Mail className="h-3 w-3" />{d.contactEmail}</a>
          </SideBox>
          {d.aiTasks.length > 0 && <SideBox title={t('Bài toán AI phù hợp', 'Suitable AI tasks')}><div className="flex flex-wrap gap-1.5">{d.aiTasks.map((x) => <Tag key={x}>{x}</Tag>)}</div></SideBox>}
          {d.keywords.length > 0 && <div className="flex flex-wrap gap-1.5">{d.keywords.map((k) => <Tag key={k} tone="muted">{k}</Tag>)}</div>}
        </aside>
      </div>
    </>
  );
}

/* ================= Evaluation services ================= */
export function ServicesPage() {
  const { t } = usePortal();
  const title = t('Đánh giá – Thử nghiệm – Kiểm định', 'Evaluation, testing & certification');
  useSeo(title, null);
  const q = useListEvaluationServices();
  return (
    <>
      <PageHeader title={title} kicker={t('Dịch vụ khoa học – kỹ thuật', 'Technical services')} crumbs={[{ label: t('Đánh giá, kiểm định', 'Testing') }]} description={t('Đánh giá hệ thống AI, an toàn thông tin, chất lượng dữ liệu và mức độ chuyển đổi số theo tiêu chuẩn quốc gia, quốc tế.', 'Assessment of AI systems, information security, data quality and digital maturity against national and international standards.')} />
      <div className="container-portal py-8">
        {q.isLoading ? <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-60" />)}</div> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !q.data?.length ? <EmptyState icon={ShieldCheck} title={t('Chưa công bố dịch vụ', 'No services yet')} /> : (
          <div className="grid gap-5 md:grid-cols-2">
            {[...q.data].sort((a, b) => a.sortOrder - b.sortOrder).map((s, i) => (
              <Link key={s.id} href={`/danh-gia-kiem-dinh/${s.slug}`} className="group flex flex-col border border-rule border-t-[3px] border-t-navy bg-card p-6 hover:border-t-seal" data-testid={`card-service-${s.id}`}>
                <div className="flex items-center justify-between"><FieldIcon name={s.icon} className="h-7 w-7 text-navy group-hover:text-seal" /><span className="num text-xs text-muted-foreground">DV-{String(i + 1).padStart(2, '0')}</span></div>
                <h2 className="mt-4 font-display text-[1.2rem] font-semibold leading-snug text-ink">{s.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                {s.standards.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{s.standards.slice(0, 3).map((x) => <span key={x} className="num border border-rule px-1.5 py-0.5 text-[0.68rem]">{x}</span>)}</div>}
                <div className="meta mt-auto flex items-center gap-1 pt-4"><Clock className="h-3 w-3" />{s.turnaround}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = usePortal();
  const q = useGetEvaluationService(slug, { query: { enabled: !!slug, queryKey: getGetEvaluationServiceQueryKey(slug) } });
  const s = q.data;
  useSeo(s?.name ?? null, s?.summary ?? null);
  if (q.isLoading) return <PageSkeleton />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFoundPage />;
  if (q.isError || !s) return <div className="container-portal py-16"><ErrorState onRetry={() => q.refetch()} /></div>;
  return (
    <>
      <PageHeader title={s.name} kicker={s.fieldName ?? t('Dịch vụ', 'Service')} description={s.summary} crumbs={[{ label: t('Đánh giá, kiểm định', 'Testing'), href: '/danh-gia-kiem-dinh' }, { label: s.name }]} />
      <div className="container-portal grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <div className="prose-portal" dangerouslySetInnerHTML={{ __html: s.description }} />
          {s.process.length > 0 && (
            <section><SectionHead title={t('Quy trình thực hiện', 'Process')} />
              <ol className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
                {s.process.map((p, i) => (
                  <li key={i} className="bg-card p-5"><div className="num text-2xl font-medium text-seal">{String(i + 1).padStart(2, '0')}</div><div className="mt-2 font-display font-semibold text-ink">{p.title}</div><p className="mt-1 text-sm text-muted-foreground">{p.description}</p></li>
                ))}
              </ol>
            </section>
          )}
          {s.deliverables.length > 0 && <section><SectionHead title={t('Kết quả bàn giao', 'Deliverables')} /><ul className="grid gap-2 sm:grid-cols-2">{s.deliverables.map((x, i) => <li key={i} className="flex gap-2 text-sm"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-navy" />{x}</li>)}</ul></section>}
          <section id="dang-ky" className="border border-rule bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{t('Đăng ký sử dụng dịch vụ', 'Request this service')}</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">{t('Mô tả hệ thống, sản phẩm cần đánh giá và mốc thời gian mong muốn.', 'Describe the system or product and desired timeline.')}</p>
            <InquiryForm type="evaluation_request" serviceId={s.id} subjectDefault={`${t('Đăng ký', 'Request')}: ${s.name}`} />
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-16 lg:self-start">
          <SideBox title={t('Tóm tắt dịch vụ', 'At a glance')}>
            <dl className="space-y-3 text-sm">
              <div><dt className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"><Clock className="h-3.5 w-3.5" />{t('Thời gian', 'Turnaround')}</dt><dd className="mt-0.5 font-medium">{s.turnaround}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-muted-foreground">{t('Chi phí', 'Fees')}</dt><dd className="mt-0.5">{s.feeNote}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-muted-foreground">{t('Liên hệ', 'Contact')}</dt><dd><a href={`mailto:${s.contactEmail}`} className="text-navy hover:underline">{s.contactEmail}</a></dd></div>
            </dl>
            <a href="#dang-ky" className="mt-4 block bg-seal px-3 py-2 text-center text-sm font-semibold text-white hover:opacity-90" data-testid="link-service-request">{t('Đăng ký ngay', 'Request now')}</a>
          </SideBox>
          {s.standards.length > 0 && <SideBox title={t('Tiêu chuẩn áp dụng', 'Standards')}><ul className="space-y-1.5 text-sm">{s.standards.map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy" /><span className="num text-[0.82rem]">{x}</span></li>)}</ul></SideBox>}
          {s.targetAudience.length > 0 && <SideBox title={t('Đối tượng', 'For')}><ul className="space-y-1.5 text-sm">{s.targetAudience.map((x) => <li key={x} className="flex gap-2"><Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-seal" />{x}</li>)}</ul></SideBox>}
        </aside>
      </div>
    </>
  );
}

