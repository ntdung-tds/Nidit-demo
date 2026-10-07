import { Link } from 'wouter';
import { useGetDashboard } from '@workspace/api-client-react';
import type { AdminArticleSummary } from '@workspace/api-client-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, CalendarClock, Inbox, Plus, Rss } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMe } from '../auth';
import { Panel, StatusChip, ErrorBox, Empty, Chip } from '../ui';
import { STATUS_LABEL, STATUS_ORDER, fmtCalDate, fmtDateTime, fmtNum, fromNow, canAccess } from '../lib';

const INQ_TYPE: Record<string, string> = { contact: 'Liên hệ', dataset_access: 'Truy cập dữ liệu', evaluation_request: 'Đánh giá' };

function ArticleRow({ a, meta }: { a: AdminArticleSummary; meta?: string }) {
  return (
    <Link href={`/quan-tri/bai-viet/${a.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors" data-testid={`link-article-${a.id}`}>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{a.title}</div>
        <div className="text-[11.5px] text-muted-foreground truncate">{a.categoryName ?? 'Chưa phân loại'} · {a.createdByName ?? '—'} · {meta ?? fromNow(a.updatedAt)}</div>
      </div>
      <StatusChip status={a.status} />
    </Link>
  );
}

export default function DashboardPage() {
  const me = useMe();
  const { data, isLoading, error, refetch } = useGetDashboard();
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        <div className="grid lg:grid-cols-3 gap-4"><Skeleton className="h-72 lg:col-span-2" /><Skeleton className="h-72" /></div>
      </div>
    );
  }
  if (error || !data) return <ErrorBox error={error} onRetry={() => refetch()} />;

  const t = data.totals;
  const kpis = [
    { label: 'Chờ duyệt', value: t.pending, href: '/quan-tri/bai-viet?status=pending', hot: t.pending > 0 },
    { label: 'Hẹn giờ đăng', value: t.scheduled, href: '/quan-tri/bai-viet?status=scheduled' },
    { label: 'Đã xuất bản', value: t.published, href: '/quan-tri/bai-viet?status=published' },
    { label: 'Yêu cầu mới', value: t.inquiriesNew, href: '/quan-tri/yeu-cau', hot: t.inquiriesNew > 0 },
    { label: 'Tin tự động chờ', value: t.crawlPending, href: '/quan-tri/tin-tu-dong' },
    { label: 'Tổng bài viết', value: t.articles, href: '/quan-tri/bai-viet' },
  ];
  const repo = [
    ['Văn bản', t.documents], ['Bộ dữ liệu', t.datasets], ['Đề tài', t.projects], ['Công bố', t.publications], ['Album', t.albums], ['Người dùng', t.users],
  ] as const;
  const totalStatus = data.statusCounts.reduce((s, c) => s + c.count, 0) || 1;
  const visits = data.visits.map((v) => ({ ...v, label: fmtCalDate(v.date).slice(0, 5) }));
  const visitSum = data.visits.reduce((s, v) => s + v.views, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="adm-eyebrow">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())}</div>
          <h1 className="adm-serif text-[30px] font-semibold leading-tight">{greet}, {me.fullName.split(' ').slice(-1)[0]}</h1>
          <p className="text-[13px] text-muted-foreground">
            {me.role === 'reviewer' ? `${t.pending} bài đang chờ bạn duyệt.` : me.role === 'editor' ? `Bạn có ${data.myWork.length} bài đang phụ trách.` : `Toàn cảnh hoạt động biên tập của Viện.`}
          </p>
        </div>
        {canAccess(me.role, 'bai-viet') && me.role !== 'reviewer' && (
          <Button asChild data-testid="button-new-article"><Link href="/quan-tri/bai-viet/moi"><Plus className="h-4 w-4 mr-1" />Viết bài mới</Link></Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border border-card-border rounded-md overflow-hidden bg-card shadow-sm divide-x divide-y xl:divide-y-0 divide-border">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group relative p-4 hover:bg-muted/50 transition-colors" data-testid={`card-kpi-${k.label}`}>
            {k.hot && <span className="absolute top-0 left-0 right-0 h-[3px] bg-sidebar-primary" />}
            <div className="adm-eyebrow">{k.label}</div>
            <div className="flex items-end justify-between mt-1.5">
              <span className={cn('adm-num text-[28px] font-semibold leading-none', k.hot && 'text-sidebar-primary')}>{fmtNum(k.value)}</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2" title={<span>Lượt xem 30 ngày <span className="text-muted-foreground font-normal adm-num">· {fmtNum(visitSum)}</span></span>}
          actions={canAccess(me.role, 'thong-ke') ? <Link href="/quan-tri/thong-ke" className="text-[12px] text-primary hover:underline">Chi tiết</Link> : undefined}>
          <div className="h-[240px] px-2 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visits} margin={{ left: -18, right: 8, top: 6 }}>
                <defs>
                  <linearGradient id="dv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} formatter={(v: number, n: string) => [fmtNum(v), n === 'views' ? 'Lượt xem' : 'Khách']} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#dv)" />
                <Area type="monotone" dataKey="visitors" stroke="hsl(var(--chart-2))" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Trạng thái bài viết" bodyClass="p-4 space-y-3">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
            {STATUS_ORDER.map((s) => {
              const c = data.statusCounts.find((x) => x.status === s)?.count ?? 0;
              return c ? <span key={s} className={cn('st-' + s, 'h-full')} style={{ width: `${(c / totalStatus) * 100}%`, background: 'currentColor' }} /> : null;
            })}
          </div>
          <div className="grid grid-cols-1 gap-1">
            {STATUS_ORDER.map((s) => (
              <Link key={s} href={`/quan-tri/bai-viet?status=${s}`} className="flex items-center justify-between py-1 text-[13px] hover:text-primary">
                <span className={cn('st', `st-${s}`)}>{STATUS_LABEL[s]}</span>
                <span className="adm-num font-semibold">{data.statusCounts.find((x) => x.status === s)?.count ?? 0}</span>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            {repo.map(([l, v]) => <div key={l}><div className="adm-num text-[16px] font-semibold">{fmtNum(v)}</div><div className="text-[11px] text-muted-foreground">{l}</div></div>)}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={<span>Hàng chờ duyệt <Chip tone={data.pendingReview.length ? 'amber' : 'muted'} className="ml-1">{data.pendingReview.length}</Chip></span>}
          actions={<Link href="/quan-tri/bai-viet?status=pending" className="text-[12px] text-primary hover:underline">Tất cả</Link>} bodyClass="divide-y divide-border">
          {data.pendingReview.length ? data.pendingReview.map((a) => <ArticleRow key={a.id} a={a} />) : <Empty title="Không có bài chờ duyệt" desc="Hàng chờ đã trống." />}
        </Panel>
        <Panel title="Việc của tôi" actions={<Link href="/quan-tri/bai-viet?mine=1" className="text-[12px] text-primary hover:underline">Bài của tôi</Link>} bodyClass="divide-y divide-border">
          {data.myWork.length ? data.myWork.map((a) => (
            <div key={a.id}>
              <ArticleRow a={a} />
              {a.reviewerNote && a.status === 'changes_requested' && <div className="mx-4 mb-2.5 -mt-1 text-[12px] rounded bg-[hsl(6_80%_96%)] text-[hsl(4_60%_36%)] px-2.5 py-1.5 border-l-2 border-destructive">{a.reviewerNote}</div>}
            </div>
          )) : <Empty title="Không có việc tồn đọng" desc="Các bài bạn phụ trách đều đã xử lý." />}
        </Panel>
        <Panel title={<span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />Lịch đăng bài</span>} bodyClass="divide-y divide-border">
          {data.scheduled.length ? data.scheduled.map((a) => <ArticleRow key={a.id} a={a} meta={`Đăng lúc ${fmtDateTime(a.publishedAt)}`} />) : <Empty title="Chưa có bài hẹn giờ" />}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2" title="Hoạt động gần đây" bodyClass="max-h-[360px] overflow-auto adm-scroll">
          {data.recentActivity.length ? (
            <ol className="relative px-4 py-3">
              {data.recentActivity.map((l) => (
                <li key={l.id} className="relative pl-5 pb-3 last:pb-0 border-l border-border ml-1">
                  <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-primary/70" />
                  <div className="text-[13px]"><strong className="font-semibold">{l.actorName}</strong> <span className="text-muted-foreground">{l.actionLabel}</span> {l.entityTitle && <span className="font-medium">“{l.entityTitle}”</span>}</div>
                  <div className="text-[11.5px] text-muted-foreground">{fromNow(l.createdAt)}{l.detail ? ` · ${l.detail}` : ''}</div>
                </li>
              ))}
            </ol>
          ) : <Empty title="Chưa có hoạt động" />}
        </Panel>
        <Panel title="Đọc nhiều nhất" bodyClass="divide-y divide-border">
          {data.topArticles.length ? data.topArticles.map((a, i) => (
            <Link key={a.id} href={`/quan-tri/bai-viet/${a.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/60">
              <span className="adm-serif text-[20px] text-muted-foreground w-5">{i + 1}</span>
              <span className="flex-1 text-[13px] truncate">{a.title}</span>
              <span className="adm-num text-[12px] text-muted-foreground">{fmtNum(a.views)}</span>
            </Link>
          )) : <Empty title="Chưa có số liệu" />}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={<span className="inline-flex items-center gap-1.5"><Rss className="h-3.5 w-3.5" />Nguồn tin tự động</span>} actions={canAccess(me.role, 'tin-tu-dong') ? <Link href="/quan-tri/tin-tu-dong" className="text-[12px] text-primary hover:underline">Quản lý</Link> : undefined} bodyClass="divide-y divide-border">
          {data.crawlSources.length ? data.crawlSources.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={cn('h-2 w-2 rounded-full', !s.isActive ? 'bg-muted-foreground/40' : s.lastStatus === 'error' ? 'bg-destructive' : 'bg-[hsl(158_60%_34%)]')} />
              <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate">{s.name}</div><div className="text-[11.5px] text-muted-foreground truncate">Lần chạy: {fromNow(s.lastRunAt)}{s.lastMessage ? ` · ${s.lastMessage}` : ''}</div></div>
              <Chip tone={s.pendingCount ? 'blue' : 'muted'}>{s.pendingCount} chờ</Chip>
            </div>
          )) : <Empty title="Chưa có nguồn tin" />}
        </Panel>
        <Panel title={<span className="inline-flex items-center gap-1.5"><Inbox className="h-3.5 w-3.5" />Yêu cầu gần đây</span>} actions={<Link href="/quan-tri/yeu-cau" className="text-[12px] text-primary hover:underline">Hộp thư</Link>} bodyClass="divide-y divide-border">
          {data.recentInquiries.length ? data.recentInquiries.map((q) => (
            <Link key={q.id} href="/quan-tri/yeu-cau" className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60">
              <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate">{q.subject || q.message}</div><div className="text-[11.5px] text-muted-foreground truncate"><span className="adm-mono">{q.code}</span> · {q.fullName} · {INQ_TYPE[q.type]}</div></div>
              <Chip tone={q.status === 'new' ? 'red' : q.status === 'processing' ? 'amber' : q.status === 'resolved' ? 'green' : 'muted'}>{({ new: 'Mới', processing: 'Đang xử lý', resolved: 'Đã xử lý', rejected: 'Từ chối' } as const)[q.status]}</Chip>
            </Link>
          )) : <Empty title="Chưa có yêu cầu" />}
        </Panel>
      </div>
    </div>
  );
}
