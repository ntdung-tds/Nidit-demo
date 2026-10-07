import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListBackups, useCreateBackup, getListBackupsQueryKey } from '@workspace/api-client-react';
import { Archive, Download, Loader2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAdminToken } from '@/lib/admin-token';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, useNotify, Panel } from '../ui';
import { BASE, fmtBytes, fmtDateTime, fmtNum } from '../lib';

export default function BackupsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const { data, isLoading, error, refetch } = useListBackups();
  const create = useCreateBackup();
  const [note, setNote] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const run = () => create.mutate({ data: { note: note.trim() || null } }, {
    onSuccess: (b) => { qc.invalidateQueries({ queryKey: getListBackupsQueryKey() }); setNote(''); notify.ok('Đã tạo bản sao lưu', `${fmtBytes(b.sizeBytes)} · ${b.tables.length} bảng`); },
    onError: (e) => notify.fail(e),
  });
  const href = (id: number) => `${BASE}api/admin/backups/${id}/download?token=${encodeURIComponent(getAdminToken() ?? '')}`;

  return (
    <div>
      <PageHeader eyebrow="Hệ thống" title="Sao lưu dữ liệu" desc="Xuất toàn bộ dữ liệu nội dung thành tệp JSON để lưu trữ ngoài hệ thống." />
      <Panel className="mb-4" bodyClass="p-4 flex flex-col sm:flex-row gap-2">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (VD: trước khi cập nhật cấu trúc chuyên mục)" className="flex-1" data-testid="input-backup-note" />
        <Button onClick={run} disabled={create.isPending} data-testid="button-create-backup">{create.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}Tạo bản sao lưu</Button>
      </Panel>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton rows={4} /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.length ? (
          <Empty icon={<Archive className="h-5 w-5" />} title="Chưa có bản sao lưu" desc="Tạo bản sao lưu đầu tiên ở trên." />
        ) : (
          <div className="divide-y divide-border">
            {data.map((b) => (
              <div key={b.id} data-testid={`row-backup-${b.id}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => setOpenId(openId === b.id ? null : b.id)} className="flex-1 min-w-0 text-left flex items-center gap-2">
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openId === b.id ? '' : '-rotate-90'}`} />
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium adm-mono">{fmtDateTime(b.createdAt)}</div>
                      <div className="text-[11.5px] text-muted-foreground truncate">{b.note ?? 'Không ghi chú'}{b.createdByName ? ` · ${b.createdByName}` : ''}</div>
                    </div>
                  </button>
                  <span className="adm-num text-[12px] text-muted-foreground">{fmtBytes(b.sizeBytes)}</span>
                  <Button size="sm" variant="outline" asChild><a href={href(b.id)} download data-testid={`link-download-backup-${b.id}`}><Download className="h-3.5 w-3.5 mr-1" />Tải về</a></Button>
                </div>
                {openId === b.id && (
                  <div className="px-10 pb-3 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 adm-rise">
                    {b.tables.map((t) => <div key={t.table} className="flex justify-between text-[12px] border-b border-dashed border-border py-0.5"><span className="adm-mono">{t.table}</span><span className="adm-num">{fmtNum(t.rows)}</span></div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
