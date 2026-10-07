import { useState } from 'react';
import { useListActivityLogs, useListUsers, getListActivityLogsQueryKey } from '@workspace/api-client-react';
import type { ListActivityLogsParams } from '@workspace/api-client-react';
import { History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Pager, Chip } from '../ui';
import { fmtDateTime, ROLE_LABEL } from '../lib';
import type { UserRole } from '@workspace/api-client-react';

const ENTITY: Record<string, string> = { article: 'Bài viết', page: 'Trang tĩnh', category: 'Chuyên mục', menu: 'Menu', document: 'Văn bản', dataset: 'Dữ liệu', project: 'Đề tài', publication: 'Công bố', album: 'Album', media: 'Media', inquiry: 'Yêu cầu', user: 'Người dùng', backup: 'Sao lưu', settings: 'Cấu hình', crawl: 'Tin tự động', auth: 'Đăng nhập' };

export default function LogsPage() {
  const users = useListUsers();
  const [actor, setActor] = useState('all');
  const [entity, setEntity] = useState('all');
  const [page, setPage] = useState(1);
  const params: ListActivityLogsParams = { page, pageSize: 30, actorId: actor === 'all' ? undefined : Number(actor), entityType: entity === 'all' ? undefined : entity };
  const { data, isLoading, error, refetch } = useListActivityLogs(params, { query: { queryKey: getListActivityLogsQueryKey(params), placeholderData: (p) => p } });

  return (
    <div>
      <PageHeader eyebrow="Hệ thống" title="Nhật ký hoạt động" desc="Mọi thao tác thay đổi dữ liệu trong khu quản trị đều được ghi lại." />
      <div className="flex flex-wrap gap-2 mb-3">
        <Select value={actor} onValueChange={(v) => { setActor(v); setPage(1); }}>
          <SelectTrigger className="w-56 h-9" data-testid="select-log-actor"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi người dùng</SelectItem>{users.data?.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={entity} onValueChange={(v) => { setEntity(v); setPage(1); }}>
          <SelectTrigger className="w-44 h-9" data-testid="select-log-entity"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi đối tượng</SelectItem>{Object.entries(ENTITY).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton rows={10} /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.items.length ? (
          <Empty icon={<History className="h-5 w-5" />} title="Chưa có hoạt động" />
        ) : (
          <ol className="divide-y divide-border">
            {data.items.map((l) => (
              <li key={l.id} className="grid md:grid-cols-[130px_200px_1fr] gap-x-4 gap-y-0.5 px-4 py-2.5 text-[12.5px]" data-testid={`row-log-${l.id}`}>
                <span className="adm-mono text-[11.5px] text-muted-foreground">{fmtDateTime(l.createdAt)}</span>
                <span className="truncate"><strong className="font-semibold">{l.actorName}</strong>{l.actorRole && <span className="text-muted-foreground"> · {ROLE_LABEL[l.actorRole as UserRole] ?? l.actorRole}</span>}</span>
                <span className="min-w-0">
                  {l.actionLabel} <Chip className="mx-1">{ENTITY[l.entityType] ?? l.entityType}</Chip>
                  {l.entityTitle && <span className="font-medium">{l.entityTitle}</span>}
                  {l.detail && <span className="block text-muted-foreground text-[11.5px]">{l.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        )}
        {data && data.totalPages > 0 && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
      </div>
    </div>
  );
}
