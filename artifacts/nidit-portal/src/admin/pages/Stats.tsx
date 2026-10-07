import { useState } from 'react';
import { useGetVisitStats, getGetVisitStatsQueryKey } from '@workspace/api-client-react';
import type { LabelCount } from '@workspace/api-client-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PageHeader, Panel, ErrorBox, Empty } from '../ui';
import { fmtNum, fmtCalDate, BASE } from '../lib';

function Bars({ items, total }: { items: LabelCount[]; total: number }) {
  if (!items.length) return <div className="p-6 text-center text-[12.5px] text-muted-foreground">Chưa có dữ liệu</div>;
  return (
    <div className="p-4 space-y-2.5">
      {items.map((x) => {
        const pct = total ? (x.count / total) * 100 : 0;
        return (
          <div key={x.label}>
            <div className="flex justify-between text-[12.5px]"><span className="truncate">{x.label}</span><span className="adm-num text-muted-foreground">{fmtNum(x.count)} · {pct.toFixed(1)}%</span></div>
            <div className="h-1.5 bg-muted rounded mt-1 overflow-hidden"><div className="h-full bg-primary rounded origin-left" style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPage() {
  const [days, setDays] = useState(30);
  const params = { days };
  const { data, isLoading, error, refetch } = useGetVisitStats(params, { query: { queryKey: getGetVisitStatsQueryKey(params), placeholderData: (p) => p } });
  const sum = (l: LabelCount[]) => l.reduce((a, b) => a + b.count, 0);

  return (
    <div>
      <PageHeader eyebrow="Báo cáo" title="Thống kê truy cập" desc="Lượt xem và khách truy cập trên cổng thông tin công khai."
        actions={<div className="flex rounded-md border border-border bg-card p-0.5">
          {[7, 30, 90].map((d) => <button key={d} onClick={() => setDays(d)} className={cn('px-3 h-8 rounded text-[12.5px]', days === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')} data-testid={`button-days-${d}`}>{d} ngày</button>)}
        </div>} />
      {isLoading ? <div className="space-y-4"><div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-72" /></div>
        : error || !data ? <ErrorBox error={error} onRetry={() => refetch()} />
        : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {[['Lượt xem', data.totalViews], ['Khách truy cập', data.totalVisitors], ['Trung bình / ngày', data.avgViewsPerDay]].map(([l, v]) => (
                <div key={l as string} className="bg-card border border-card-border rounded-md p-4 shadow-sm">
                  <div className="adm-eyebrow">{l}</div>
                  <div className="adm-num text-[30px] font-semibold mt-1">{fmtNum(Math.round(v as number))}</div>
                  <div className="text-[11.5px] text-muted-foreground">{data.days} ngày gần nhất</div>
                </div>
              ))}
            </div>
            <Panel title="Lượt xem theo ngày" bodyClass="p-3 h-72">
              {data.daily.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs><linearGradient id="adm-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d: string) => fmtCalDate(d).slice(0, 5)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} minTickGap={20} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(d) => fmtCalDate(String(d))} formatter={(v: number, n: string) => [fmtNum(v), n === 'views' ? 'Lượt xem' : 'Khách']} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#adm-g)" />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(var(--sidebar-primary))" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Empty title="Chưa có lượt truy cập" />}
            </Panel>
            <div className="grid lg:grid-cols-2 gap-4">
              <Panel title="Bài viết xem nhiều" bodyClass="divide-y divide-border">
                {!data.topArticles.length ? <div className="p-6 text-center text-[12.5px] text-muted-foreground">Chưa có dữ liệu</div> : data.topArticles.map((a, i) => (
                  <a key={a.id} href={`${BASE}tin-tuc/${a.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 hover:bg-muted/40">
                    <span className="adm-num text-muted-foreground w-5">{i + 1}</span><span className="flex-1 text-[13px] truncate">{a.title}</span><span className="adm-num text-[12.5px]">{fmtNum(a.views)}</span>
                  </a>
                ))}
              </Panel>
              <Panel title="Trang xem nhiều" bodyClass="divide-y divide-border">
                {!data.topPages.length ? <div className="p-6 text-center text-[12.5px] text-muted-foreground">Chưa có dữ liệu</div> : data.topPages.map((p) => (
                  <div key={p.path} className="flex items-center gap-3 px-4 py-2"><span className="flex-1 adm-mono text-[12px] truncate">{p.path}</span><span className="adm-num text-[12.5px]">{fmtNum(p.views)}</span></div>
                ))}
              </Panel>
              <Panel title="Chuyên mục"><Bars items={data.sections} total={sum(data.sections)} /></Panel>
              <div className="grid gap-4">
                <Panel title="Thiết bị"><Bars items={data.devices} total={sum(data.devices)} /></Panel>
                <Panel title="Nguồn truy cập"><Bars items={data.referrers} total={sum(data.referrers)} /></Panel>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
