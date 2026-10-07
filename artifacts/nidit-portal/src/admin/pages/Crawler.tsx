import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListCrawlSources, useCreateCrawlSource, useUpdateCrawlSource, useDeleteCrawlSource, useRunCrawlSource, useRunAllCrawlSources,
  useListCrawlItems, useImportCrawlItem, useRejectCrawlItem, useListCategories,
  getListCrawlSourcesQueryKey, getListCrawlItemsQueryKey, getListAdminArticlesQueryKey, getGetDashboardQueryKey,
} from '@workspace/api-client-react';
import type { CrawlSource, CrawlItem, CrawlItemStatus, CrawlRunResult, ListCrawlItemsParams } from '@workspace/api-client-react';
import { Play, PlayCircle, Plus, Pencil, Trash2, Rss, ShieldAlert, ExternalLink, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useMe } from '../auth';
import { PageHeader, Panel, Empty, ErrorBox, RowsSkeleton, Confirm, F, TagInput, useNotify, Chip, Pager, SearchBox, Thumb } from '../ui';
import { fmtDateTime, fromNow } from '../lib';

const MAX = 5;
type SF = { name: string; url: string; categoryId: string; isActive: boolean; intervalMinutes: string; keywords: string[] };

export default function CrawlerPage() {
  const me = useMe();
  const isAdmin = me.role === 'admin';
  const qc = useQueryClient();
  const notify = useNotify();
  const [, navigate] = useLocation();
  const sources = useListCrawlSources();
  const cats = useListCategories();
  const createS = useCreateCrawlSource();
  const updateS = useUpdateCrawlSource();
  const deleteS = useDeleteCrawlSource();
  const runOne = useRunCrawlSource();
  const runAll = useRunAllCrawlSources();
  const importItem = useImportCrawlItem();
  const reject = useRejectCrawlItem();

  const [status, setStatus] = useState<CrawlItemStatus>('pending');
  const [sourceId, setSourceId] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const params: ListCrawlItemsParams = { page, pageSize: 15, status, sourceId: sourceId === 'all' ? undefined : Number(sourceId), q: q || undefined };
  const items = useListCrawlItems(params, { query: { queryKey: getListCrawlItemsQueryKey(params), placeholderData: (p) => p } });

  const [edit, setEdit] = useState<CrawlSource | 'new' | null>(null);
  const [sf, setSf] = useState<SF>({ name: '', url: '', categoryId: 'none', isActive: true, intervalMinutes: '60', keywords: [] });
  const [results, setResults] = useState<CrawlRunResult[] | null>(null);
  const [imp, setImp] = useState<CrawlItem | null>(null);
  const [impCat, setImpCat] = useState('none');
  const [runningId, setRunningId] = useState<number | null>(null);

  const inv = () => {
    qc.invalidateQueries({ queryKey: getListCrawlSourcesQueryKey() });
    qc.invalidateQueries({ queryKey: getListCrawlItemsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
  };
  const count = sources.data?.length ?? 0;

  const openS = (s: CrawlSource | 'new') => {
    setEdit(s);
    setSf(s === 'new' ? { name: '', url: '', categoryId: 'none', isActive: true, intervalMinutes: '60', keywords: [] }
      : { name: s.name, url: s.url, categoryId: s.categoryId ? String(s.categoryId) : 'none', isActive: s.isActive, intervalMinutes: String(s.intervalMinutes), keywords: s.keywords });
  };
  const saveS = () => {
    const body = { name: sf.name.trim(), url: sf.url.trim(), categoryId: sf.categoryId === 'none' ? null : Number(sf.categoryId), isActive: sf.isActive, intervalMinutes: Number(sf.intervalMinutes) || 60, keywords: sf.keywords };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu nguồn tin', body.name); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') createS.mutate({ data: body }, o); else if (edit) updateS.mutate({ id: edit.id, data: body }, o);
  };

  return (
    <div>
      <PageHeader eyebrow="Biên tập" title="Tin tự động (RSS)"
        desc="Thu thập tin từ tối đa 5 nguồn RSS vào hàng chờ. Biên tập viên nhập tin thành bản nháp để biên tập và gửi duyệt."
        actions={isAdmin && <>
          <Button variant="outline" onClick={() => runAll.mutate(undefined, { onSuccess: (r) => { inv(); setResults(r); }, onError: (e) => notify.fail(e) })} disabled={runAll.isPending || !count} data-testid="button-run-all">
            {runAll.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-1" />}Chạy tất cả
          </Button>
          <Button onClick={() => openS('new')} disabled={count >= MAX} data-testid="button-new-source"><Plus className="h-4 w-4 mr-1" />Thêm nguồn</Button>
        </>} />

      <div className="mb-4 flex items-start gap-2.5 rounded-md border-l-[3px] border-sidebar-primary bg-card px-3 py-2.5 text-[12.5px] shadow-sm">
        <ShieldAlert className="h-4 w-4 text-sidebar-primary mt-0.5 shrink-0" />
        <div><strong>Tin thu thập không bao giờ được xuất bản tự động.</strong> Mỗi tin phải được nhập thành bản nháp, biên tập lại, ghi nguồn và qua phê duyệt như bài viết thông thường.</div>
      </div>

      <Panel className="mb-5" title={<span className="flex items-center gap-3">Nguồn tin <span className="adm-num font-normal text-muted-foreground">{count}/{MAX}</span><Progress value={(count / MAX) * 100} className="w-24 h-1.5" /></span>}
        actions={!isAdmin && <Chip>Chỉ quản trị quản lý nguồn</Chip>} bodyClass="divide-y divide-border">
        {sources.isLoading ? <RowsSkeleton rows={3} /> : sources.error ? <div className="p-4"><ErrorBox error={sources.error} onRetry={() => sources.refetch()} /></div> : !count ? (
          <Empty icon={<Rss className="h-5 w-5" />} title="Chưa cấu hình nguồn tin" desc={isAdmin ? 'Thêm nguồn RSS đầu tiên để bắt đầu thu thập.' : 'Quản trị viên sẽ cấu hình nguồn tin.'} />
        ) : sources.data!.map((s) => (
          <div key={s.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 px-4 py-3" data-testid={`row-source-${s.id}`}>
            <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', !s.isActive ? 'bg-muted-foreground/40' : s.lastStatus === 'error' ? 'bg-destructive' : 'bg-[hsl(158_60%_34%)]')} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold">{s.name}{!s.isActive && <Chip>Tạm dừng</Chip>}</div>
              <div className="text-[11.5px] text-muted-foreground truncate adm-mono">{s.url}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">
                Mỗi {s.intervalMinutes} phút · {s.categoryName ?? 'Chưa chọn chuyên mục'} · Lần chạy {fromNow(s.lastRunAt)}
                {s.lastMessage && <span className={s.lastStatus === 'error' ? 'text-destructive' : ''}> · {s.lastMessage}</span>}
              </div>
              {s.keywords.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{s.keywords.map((k) => <span key={k} className="text-[10.5px] rounded bg-secondary px-1.5">{k}</span>)}</div>}
            </div>
            <div className="text-right text-[12px] shrink-0"><div className="adm-num font-semibold">{s.pendingCount} chờ</div><div className="text-muted-foreground adm-num">{s.totalCount} tổng</div></div>
            {isAdmin && (
              <div className="flex gap-0.5 shrink-0">
                <Button size="sm" variant="outline" disabled={runOne.isPending} onClick={() => { setRunningId(s.id); runOne.mutate({ id: s.id }, { onSuccess: (r) => { inv(); setResults([r]); }, onError: (e) => notify.fail(e), onSettled: () => setRunningId(null) }); }} data-testid={`button-run-source-${s.id}`}>
                  {runningId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}<span className="ml-1">Chạy</span>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openS(s)} data-testid={`button-edit-source-${s.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                <Confirm title={`Xóa nguồn “${s.name}”?`} desc="Các tin đang chờ của nguồn này cũng có thể bị xóa. Bài đã nhập vẫn được giữ."
                  onConfirm={() => deleteS.mutate({ id: s.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa nguồn tin'); }, onError: (e) => notify.fail(e) })}
                  trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} />
              </div>
            )}
          </div>
        ))}
      </Panel>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex rounded-md border border-border bg-card p-0.5">
          {(['pending', 'imported', 'rejected'] as const).map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 h-8 rounded text-[12.5px]', status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')} data-testid={`tab-crawl-${s}`}>
              {({ pending: 'Hàng chờ', imported: 'Đã nhập', rejected: 'Đã loại' })[s]} <span className="adm-num opacity-70">{items.data?.statusCounts.find((c) => c.status === s)?.count ?? ''}</span>
            </button>
          ))}
        </div>
        <Select value={sourceId} onValueChange={(v) => { setSourceId(v); setPage(1); }}>
          <SelectTrigger className="w-52 h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi nguồn</SelectItem>{sources.data?.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} className="w-64" />
      </div>

      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {items.isLoading ? <RowsSkeleton /> : items.error ? <div className="p-4"><ErrorBox error={items.error} onRetry={() => items.refetch()} /></div> : !items.data?.items.length ? (
          <Empty icon={<Rss className="h-5 w-5" />} title={status === 'pending' ? 'Hàng chờ trống' : 'Không có tin'} desc={status === 'pending' ? 'Không có tin mới cần xử lý.' : undefined} />
        ) : (
          <div className="divide-y divide-border">
            {items.data.items.map((it) => (
              <div key={it.id} className="flex gap-3 px-4 py-3" data-testid={`row-crawl-${it.id}`}>
                <Thumb src={it.imageUrl} className="h-14 w-20 rounded border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <a href={it.link} target="_blank" rel="noreferrer" className="text-[13.5px] font-medium hover:text-primary inline-flex items-start gap-1">{it.title}<ExternalLink className="h-3 w-3 mt-1 shrink-0 opacity-60" /></a>
                  {it.summary && <p className="text-[12px] text-muted-foreground line-clamp-2">{it.summary}</p>}
                  <div className="text-[11.5px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 items-center">
                    <span className="font-medium text-foreground/70">{it.sourceName}</span>
                    <span>Đăng {fmtDateTime(it.publishedAt)}</span><span>Thu {fromNow(it.fetchedAt)}</span>
                    {it.matchedKeywords.map((k) => <Chip key={k} tone="blue">{k}</Chip>)}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0 items-end">
                  {it.status === 'pending' && <>
                    <Button size="sm" onClick={() => { setImp(it); setImpCat(sources.data?.find((s) => s.id === it.sourceId)?.categoryId?.toString() ?? 'none'); }} data-testid={`button-import-${it.id}`}><Download className="h-3.5 w-3.5 mr-1" />Nhập thành nháp</Button>
                    <Confirm title="Loại tin này?" desc="Tin sẽ chuyển sang danh sách Đã loại." confirmLabel="Loại tin"
                      onConfirm={() => reject.mutate({ id: it.id }, { onSuccess: () => { inv(); notify.ok('Đã loại tin'); }, onError: (e) => notify.fail(e) })}
                      trigger={<Button size="sm" variant="ghost" className="text-muted-foreground" data-testid={`button-reject-${it.id}`}><X className="h-3.5 w-3.5 mr-1" />Loại</Button>} />
                  </>}
                  {it.status === 'imported' && it.articleId && <Button size="sm" variant="outline" onClick={() => navigate(`/quan-tri/bai-viet/${it.articleId}`)}>Mở bản nháp</Button>}
                  {it.status === 'rejected' && <Chip>Đã loại</Chip>}
                </div>
              </div>
            ))}
          </div>
        )}
        {items.data && items.data.totalPages > 0 && <Pager page={items.data.page} totalPages={items.data.totalPages} total={items.data.total} onPage={setPage} />}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit === 'new' ? `Thêm nguồn tin (${count + 1}/${MAX})` : 'Sửa nguồn tin'}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Tên nguồn" required><Input value={sf.name} onChange={(e) => setSf({ ...sf, name: e.target.value })} data-testid="input-source-name" /></F>
            <F label="Chu kỳ (phút)"><Input type="number" min={5} value={sf.intervalMinutes} onChange={(e) => setSf({ ...sf, intervalMinutes: e.target.value })} data-testid="input-source-interval" /></F>
            <F label="Địa chỉ RSS" required className="sm:col-span-2"><Input value={sf.url} onChange={(e) => setSf({ ...sf, url: e.target.value })} className="adm-mono" placeholder="https://…/rss" data-testid="input-source-url" /></F>
            <F label="Chuyên mục đích">
              <Select value={sf.categoryId} onValueChange={(v) => setSf({ ...sf, categoryId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">Chưa chọn</SelectItem>{cats.data?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </F>
            <F label="Trạng thái"><label className="flex items-center gap-2 h-9 text-[13px]"><Switch checked={sf.isActive} onCheckedChange={(v) => setSf({ ...sf, isActive: v })} />Đang hoạt động</label></F>
            <F label="Từ khóa lọc" hint="Chỉ giữ tin chứa ít nhất một từ khóa. Bỏ trống để lấy tất cả." className="sm:col-span-2"><TagInput value={sf.keywords} onChange={(v) => setSf({ ...sf, keywords: v })} testId="input-source-keywords" /></F>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Hủy</Button>
            <Button onClick={saveS} disabled={!sf.name.trim() || !sf.url.trim() || createS.isPending || updateS.isPending} data-testid="button-save-source">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!imp} onOpenChange={(o) => !o && setImp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập tin thành bản nháp</DialogTitle>
            <DialogDescription>“{imp?.title}” sẽ trở thành bài viết ở trạng thái Nháp, chưa hiển thị công khai.</DialogDescription>
          </DialogHeader>
          <F label="Chuyên mục">
            <Select value={impCat} onValueChange={setImpCat}>
              <SelectTrigger data-testid="select-import-category"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Chưa phân loại</SelectItem>{cats.data?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImp(null)}>Hủy</Button>
            <Button disabled={importItem.isPending} data-testid="button-confirm-import" onClick={() => imp && importItem.mutate({ id: imp.id, data: { categoryId: impCat === 'none' ? null : Number(impCat) } }, {
              onSuccess: (a) => {
                inv(); qc.invalidateQueries({ queryKey: getListAdminArticlesQueryKey() }); setImp(null);
                notify.ok('Đã tạo bản nháp', a.title);
                navigate(`/quan-tri/bai-viet/${a.id}`);
              },
              onError: (e) => notify.fail(e),
            })}>{importItem.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Nhập và mở để biên tập</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!results} onOpenChange={(o) => !o && setResults(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kết quả thu thập</DialogTitle><DialogDescription>Tin mới đã vào hàng chờ, chưa có tin nào được xuất bản.</DialogDescription></DialogHeader>
          <div className="divide-y divide-border border border-border rounded-md">
            {results?.map((r) => (
              <div key={r.sourceId} className="px-3 py-2.5">
                <div className="flex items-center justify-between"><span className="font-semibold text-[13px]">{r.sourceName}</span><Chip tone={r.status === 'error' ? 'red' : 'green'}>{r.status === 'error' ? 'Lỗi' : 'Thành công'}</Chip></div>
                <div className="grid grid-cols-4 gap-2 mt-1.5 text-center">
                  {[['Lấy về', r.fetched], ['Mới', r.created], ['Trùng', r.duplicates], ['Bị lọc', r.filtered]].map(([l, v]) => (
                    <div key={l as string} className="rounded bg-muted py-1"><div className="adm-num font-semibold">{v}</div><div className="text-[10.5px] text-muted-foreground">{l}</div></div>
                  ))}
                </div>
                <div className="text-[11.5px] text-muted-foreground mt-1">{r.message} · {fmtDateTime(r.ranAt)}</div>
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => { setResults(null); setStatus('pending'); }}>Xem hàng chờ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
