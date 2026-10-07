import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListMedia, useCreateMedia, useDeleteMedia, getListMediaQueryKey } from '@workspace/api-client-react';
import type { MediaType, ListMediaParams } from '@workspace/api-client-react';
import { Plus, Trash2, Copy, ImageIcon, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader, Empty, ErrorBox, Confirm, F, useNotify, Thumb, SearchBox, Chip } from '../ui';
import { fromNow, nn } from '../lib';

const TYPE_LABEL: Record<MediaType, string> = { image: 'Ảnh', video: 'Video', file: 'Tệp' };

export default function MediaPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const [q, setQ] = useState('');
  const [type, setType] = useState<MediaType | 'all'>('all');
  const params: ListMediaParams = { q: q || undefined, type: type === 'all' ? undefined : type };
  const { data, isLoading, error, refetch } = useListMedia(params, { query: { queryKey: getListMediaQueryKey(params) } });
  const create = useCreateMedia();
  const del = useDeleteMedia();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ url: '', title: '', alt: '', type: 'image' as MediaType });
  const inv = () => qc.invalidateQueries({ queryKey: getListMediaQueryKey() });

  const copy = (url: string) => { navigator.clipboard?.writeText(url).then(() => notify.ok('Đã sao chép đường dẫn', url), () => notify.fail(new Error('Trình duyệt chặn sao chép'))); };
  const submit = () => create.mutate({ data: { url: f.url.trim(), title: f.title.trim(), alt: nn(f.alt), type: f.type } }, {
    onSuccess: () => { inv(); setOpen(false); setF({ url: '', title: '', alt: '', type: 'image' }); notify.ok('Đã đăng ký media'); },
    onError: (e) => notify.fail(e),
  });

  return (
    <div>
      <PageHeader eyebrow="Truyền thông" title="Thư viện media" desc="Đăng ký ảnh, video, tệp bằng đường dẫn để dùng lại trong bài viết, album và văn bản."
        actions={<Button onClick={() => setOpen(true)} data-testid="button-new-media"><Plus className="h-4 w-4 mr-1" />Đăng ký media</Button>} />
      <div className="flex flex-wrap gap-2 mb-4">
        <SearchBox value={q} onChange={setQ} className="w-72" />
        <Select value={type} onValueChange={(v) => setType(v as MediaType | 'all')}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi loại</SelectItem>{(Object.keys(TYPE_LABEL) as MediaType[]).map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {isLoading ? <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
        : error ? <ErrorBox error={error} onRetry={() => refetch()} />
        : !data?.length ? <div className="bg-card border border-card-border rounded-md"><Empty icon={<ImageIcon className="h-5 w-5" />} title="Thư viện trống" desc="Đăng ký media đầu tiên bằng đường dẫn tới tệp." action={<Button variant="outline" onClick={() => setOpen(true)}>Đăng ký media</Button>} /></div>
        : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {data.map((m) => (
              <div key={m.id} className="group bg-card border border-card-border rounded-md overflow-hidden shadow-sm" data-testid={`card-media-${m.id}`}>
                <div className="relative">
                  <Thumb src={m.url} kind={m.type} alt={m.alt ?? m.title} className="w-full aspect-square" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => copy(m.url)} title="Sao chép đường dẫn" data-testid={`button-copy-media-${m.id}`}><Copy className="h-3.5 w-3.5" /></Button>
                    <Confirm title="Xóa media này?" desc="Bài viết đang dùng đường dẫn này có thể bị lỗi ảnh."
                      onConfirm={() => del.mutate({ id: m.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa media'); }, onError: (e) => notify.fail(e) })}
                      trigger={<Button size="icon" variant="secondary" className="h-7 w-7 text-destructive" title="Xóa" data-testid={`button-delete-media-${m.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>} />
                  </div>
                </div>
                <div className="px-2 py-1.5">
                  <div className="text-[12px] font-medium truncate">{m.title}</div>
                  <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground"><Chip className="py-0">{TYPE_LABEL[m.type]}</Chip>{fromNow(m.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Đăng ký media</DialogTitle><DialogDescription>Hệ thống lưu đường dẫn, không tải tệp lên máy chủ.</DialogDescription></DialogHeader>
          <div className="flex gap-3">
            <Thumb src={f.url || null} kind={f.type} className="h-24 w-24 rounded border border-border shrink-0" />
            <div className="flex-1 space-y-3">
              <F label="Đường dẫn" required><div className="relative"><Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} className="pl-8 adm-mono" placeholder="/images/… hoặc https://…" data-testid="input-media-url" /></div></F>
              <F label="Loại"><Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as MediaType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(TYPE_LABEL) as MediaType[]).map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent></Select></F>
            </div>
          </div>
          <F label="Tiêu đề" required><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="input-media-title" /></F>
          <F label="Văn bản thay thế (alt)"><Input value={f.alt} onChange={(e) => setF({ ...f, alt: e.target.value })} /></F>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={submit} disabled={!f.url.trim() || !f.title.trim() || create.isPending} data-testid="button-save-media">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
