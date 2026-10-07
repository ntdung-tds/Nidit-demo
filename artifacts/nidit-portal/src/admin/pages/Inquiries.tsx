import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListInquiries, useUpdateInquiry, getListInquiriesQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import type { Inquiry, InquiryStatus, InquiryType, ListInquiriesParams } from '@workspace/api-client-react';
import { Inbox, Mail, Phone, Building2, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, F, useNotify, Chip, Pager } from '../ui';
import { fmtDateTime, fromNow, nn } from '../lib';

const TYPE: Record<InquiryType, string> = { contact: 'Liên hệ', dataset_access: 'Truy cập dữ liệu', evaluation_request: 'Đề nghị đánh giá' };
const STATUS: Record<InquiryStatus, string> = { new: 'Mới', processing: 'Đang xử lý', resolved: 'Đã giải quyết', rejected: 'Từ chối' };
const TONE: Record<InquiryStatus, 'red' | 'amber' | 'green' | 'muted'> = { new: 'red', processing: 'amber', resolved: 'green', rejected: 'muted' };

export default function InquiriesPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const [status, setStatus] = useState<InquiryStatus | 'all'>('all');
  const [type, setType] = useState<InquiryType | 'all'>('all');
  const [page, setPage] = useState(1);
  const params: ListInquiriesParams = { page, pageSize: 20, status: status === 'all' ? undefined : status, type: type === 'all' ? undefined : type };
  const { data, isLoading, error, refetch } = useListInquiries(params, { query: { queryKey: getListInquiriesQueryKey(params), placeholderData: (p) => p } });
  const update = useUpdateInquiry();
  const [sel, setSel] = useState<Inquiry | null>(null);
  const [note, setNote] = useState('');
  const [st, setSt] = useState<InquiryStatus>('new');
  useEffect(() => { if (sel) { setNote(sel.adminNote ?? ''); setSt(sel.status); } }, [sel]);

  const save = () => sel && update.mutate({ id: sel.id, data: { status: st, adminNote: nn(note) } }, {
    onSuccess: (r) => { setSel(r); qc.invalidateQueries({ queryKey: getListInquiriesQueryKey() }); qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); notify.ok('Đã cập nhật yêu cầu', r.code); },
    onError: (e) => notify.fail(e),
  });

  return (
    <div>
      <PageHeader eyebrow="Tương tác" title="Yêu cầu, liên hệ" desc="Thư liên hệ, đề nghị truy cập dữ liệu và đề nghị đánh giá từ cổng thông tin." />
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex rounded-md border border-border bg-card p-0.5">
          {(['all', 'new', 'processing', 'resolved', 'rejected'] as const).map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 h-8 rounded text-[12.5px]', status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')} data-testid={`tab-inquiry-${s}`}>
              {s === 'all' ? 'Tất cả' : STATUS[s]} {s !== 'all' && <span className="adm-num opacity-70">{data?.statusCounts.find((c) => c.status === s)?.count ?? ''}</span>}
            </button>
          ))}
        </div>
        <Select value={type} onValueChange={(v) => { setType(v as InquiryType | 'all'); setPage(1); }}>
          <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi loại</SelectItem>{(Object.keys(TYPE) as InquiryType[]).map((t) => <SelectItem key={t} value={t}>{TYPE[t]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-4 items-start">
        <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
          {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.items.length ? (
            <Empty icon={<Inbox className="h-5 w-5" />} title="Không có yêu cầu" desc="Hộp thư trống với bộ lọc hiện tại." />
          ) : (
            <div className="divide-y divide-border">
              {data.items.map((i) => (
                <button key={i.id} onClick={() => setSel(i)} className={cn('w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/40', sel?.id === i.id && 'bg-accent/60')} data-testid={`row-inquiry-${i.id}`}>
                  <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', i.status === 'new' ? 'bg-sidebar-primary' : 'bg-transparent')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className={cn('text-[13px] truncate', i.status === 'new' && 'font-semibold')}>{i.fullName}</span><span className="adm-mono text-[11px] text-muted-foreground">{i.code}</span></div>
                    <div className="text-[12.5px] truncate">{i.subject ?? i.datasetTitle ?? i.serviceName ?? TYPE[i.type]}</div>
                    <div className="text-[12px] text-muted-foreground line-clamp-1">{i.message}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground">{fromNow(i.createdAt)}</span>
                    <Chip tone={TONE[i.status]}>{STATUS[i.status]}</Chip>
                  </div>
                </button>
              ))}
            </div>
          )}
          {data && data.totalPages > 0 && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
        </div>

        <div className="bg-card border border-card-border rounded-md shadow-sm lg:sticky lg:top-4">
          {!sel ? <Empty icon={<Mail className="h-5 w-5" />} title="Chọn một yêu cầu" desc="Nội dung chi tiết và ghi chú xử lý hiển thị tại đây." /> : (
            <div className="p-4 space-y-4 adm-rise" key={sel.id}>
              <div>
                <div className="flex items-center gap-2"><Chip tone="blue">{TYPE[sel.type]}</Chip><span className="adm-mono text-[11.5px] text-muted-foreground">{sel.code}</span></div>
                <h2 className="adm-serif text-[20px] font-semibold mt-1.5">{sel.subject ?? TYPE[sel.type]}</h2>
                <div className="text-[11.5px] text-muted-foreground">Gửi lúc {fmtDateTime(sel.createdAt)}</div>
              </div>
              <div className="grid gap-1.5 text-[12.5px]">
                <div className="font-semibold">{sel.fullName}</div>
                <a href={`mailto:${sel.email}`} className="flex items-center gap-2 text-primary"><Mail className="h-3.5 w-3.5" />{sel.email}</a>
                {sel.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{sel.phone}</div>}
                {sel.organization && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{sel.organization}</div>}
                {(sel.datasetTitle || sel.serviceName) && <div className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-muted-foreground" />{sel.datasetTitle ?? sel.serviceName}</div>}
              </div>
              <div className="rounded-md bg-muted/60 border border-border p-3 text-[13px] whitespace-pre-wrap leading-relaxed">{sel.message}</div>
              <div className="border-t border-border pt-3 space-y-3">
                <F label="Trạng thái xử lý">
                  <Select value={st} onValueChange={(v) => setSt(v as InquiryStatus)}>
                    <SelectTrigger data-testid="select-inquiry-status"><SelectValue /></SelectTrigger>
                    <SelectContent>{(Object.keys(STATUS) as InquiryStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Ghi chú nội bộ"><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Đã gọi lại, đã gửi hướng dẫn…" data-testid="input-inquiry-note" /></F>
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] text-muted-foreground">{sel.handledByName ? `Xử lý bởi ${sel.handledByName} · ${fromNow(sel.updatedAt)}` : 'Chưa có người xử lý'}</span>
                  <Button size="sm" onClick={save} disabled={update.isPending} data-testid="button-save-inquiry">{update.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}Cập nhật</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
