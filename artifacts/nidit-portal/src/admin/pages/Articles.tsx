import { useState } from 'react';
import { Link, useSearch, useLocation } from 'wouter';
import { useListAdminArticles, useListCategories, getListAdminArticlesQueryKey } from '@workspace/api-client-react';
import type { ArticleStatus, ArticleOrigin, ListAdminArticlesParams } from '@workspace/api-client-react';
import { Plus, Rss, Star, Eye, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useMe } from '../auth';
import { PageHeader, StatusChip, Empty, ErrorBox, RowsSkeleton, Pager, SearchBox, Thumb, Chip } from '../ui';
import { STATUS_LABEL, STATUS_ORDER, fmtDateTime, fmtNum, fromNow } from '../lib';

export default function ArticlesPage() {
  const me = useMe();
  const search = new URLSearchParams(useSearch());
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<ArticleStatus | 'all'>((search.get('status') as ArticleStatus) || 'all');
  const [mine, setMine] = useState(search.get('mine') === '1');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [origin, setOrigin] = useState<ArticleOrigin | 'all'>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const cats = useListCategories();

  const params: ListAdminArticlesParams = {
    page, pageSize: 20,
    status: status === 'all' ? undefined : status,
    categoryId: categoryId === 'all' ? undefined : Number(categoryId),
    createdById: mine ? me.id : undefined,
    origin: origin === 'all' ? undefined : origin,
    q: q || undefined,
  };
  const { data, isLoading, error, refetch, isFetching } = useListAdminArticles(params, { query: { queryKey: getListAdminArticlesQueryKey(params), placeholderData: (p) => p } });
  const counts = data?.statusCounts ?? [];
  const all = counts.reduce((s, c) => s + c.count, 0);
  const reset = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div>
      <PageHeader eyebrow="Biên tập" title="Bài viết"
        desc="Mọi bài viết đi qua quy trình: Nháp → Chờ duyệt → Đã duyệt → Xuất bản. Chỉ cán bộ duyệt được công bố."
        actions={me.role !== 'reviewer' && <Button asChild data-testid="button-new-article"><Link href="/quan-tri/bai-viet/moi"><Plus className="h-4 w-4 mr-1" />Viết bài mới</Link></Button>} />

      <div className="flex gap-0.5 overflow-x-auto adm-scroll border-b border-border mb-3 -mx-1 px-1">
        {(['all', ...STATUS_ORDER] as const).map((s) => {
          const c = s === 'all' ? all : counts.find((x) => x.status === s)?.count ?? 0;
          const active = status === s;
          return (
            <button key={s} onClick={() => reset(() => setStatus(s))}
              className={cn('relative px-3 h-9 text-[13px] whitespace-nowrap transition-colors', active ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground')}
              data-testid={`tab-status-${s}`}>
              {s === 'all' ? 'Tất cả' : STATUS_LABEL[s]} <span className="adm-num text-[11px] ml-1 opacity-70">{c}</span>
              {active && <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-sidebar-primary" />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <SearchBox value={q} onChange={(v) => reset(() => setQ(v))} placeholder="Tìm theo tiêu đề…" className="w-full sm:w-72" />
        <Select value={categoryId} onValueChange={(v) => reset(() => setCategoryId(v))}>
          <SelectTrigger className="w-48 h-9" data-testid="select-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi chuyên mục</SelectItem>
            {cats.data?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.parentId ? '— ' : ''}{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={origin} onValueChange={(v) => reset(() => setOrigin(v as ArticleOrigin | 'all'))}>
          <SelectTrigger className="w-40 h-9" data-testid="select-origin"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi nguồn</SelectItem>
            <SelectItem value="manual">Biên tập viên</SelectItem>
            <SelectItem value="crawler">Tin tự động</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-[13px] ml-1 cursor-pointer">
          <Switch checked={mine} onCheckedChange={(v) => reset(() => setMine(v))} data-testid="switch-mine" />Bài của tôi
        </label>
        {isFetching && !isLoading && <span className="text-[11.5px] text-muted-foreground ml-auto">Đang cập nhật…</span>}
      </div>

      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_150px_140px_130px_70px] gap-3 px-4 h-9 items-center border-b border-border bg-muted/50 adm-eyebrow">
          <span>Bài viết</span><span>Trạng thái</span><span>Người tạo</span><span>Cập nhật</span><span className="text-right">Xem</span>
        </div>
        {isLoading ? <RowsSkeleton rows={8} cols={5} /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.items.length ? (
          <Empty title="Không có bài viết phù hợp" desc="Thử bỏ bớt bộ lọc, hoặc tạo bài mới."
            action={me.role !== 'reviewer' ? <Button variant="outline" onClick={() => navigate('/quan-tri/bai-viet/moi')}>Viết bài mới</Button> : undefined} />
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((a) => (
              <Link key={a.id} href={`/quan-tri/bai-viet/${a.id}`}
                className="grid md:grid-cols-[1fr_150px_140px_130px_70px] gap-x-3 gap-y-1 px-4 py-2.5 items-center hover:bg-muted/50 transition-colors" data-testid={`row-article-${a.id}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Thumb src={a.coverImage} className="h-10 w-14 rounded shrink-0 border border-border" />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium truncate flex items-center gap-1.5">
                      {a.isFeatured && <Star className="h-3 w-3 fill-[hsl(40_80%_50%)] text-[hsl(40_80%_50%)] shrink-0" />}
                      <span className="truncate">{a.title}</span>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5 truncate">
                      <span>{a.categoryName ?? 'Chưa phân loại'}</span>
                      <span className="uppercase adm-mono text-[10px]">{a.language}</span>
                      {a.origin === 'crawler' && <Chip tone="blue"><Rss className="h-2.5 w-2.5" />{a.sourceName ?? 'Tin tự động'}</Chip>}
                      {a.status === 'scheduled' && <span>· đăng {fmtDateTime(a.publishedAt)}</span>}
                      {a.unpublishAt && <span>· gỡ {fmtDateTime(a.unpublishAt)}</span>}
                    </div>
                    {a.reviewerNote && a.status === 'changes_requested' && (
                      <div className="text-[11.5px] text-destructive flex items-center gap-1 truncate mt-0.5"><MessageSquareWarning className="h-3 w-3 shrink-0" /><span className="truncate">{a.reviewerNote}</span></div>
                    )}
                  </div>
                </div>
                <div><StatusChip status={a.status} /></div>
                <div className="text-[12.5px] truncate">{a.createdByName ?? '—'}</div>
                <div className="text-[12px] text-muted-foreground" title={fmtDateTime(a.updatedAt)}>{fromNow(a.updatedAt)}</div>
                <div className="text-[12px] text-muted-foreground adm-num md:text-right flex items-center md:justify-end gap-1"><Eye className="h-3 w-3" />{fmtNum(a.viewCount)}</div>
              </Link>
            ))}
          </div>
        )}
        {data && data.totalPages > 0 && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
      </div>
    </div>
  );
}
