import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListAlbums, useCreateAlbum, useUpdateAlbum, useDeleteAlbum, getListAlbumsQueryKey } from '@workspace/api-client-react';
import type { Album, AlbumInput, AlbumItem, AlbumType, ListAlbumsParams } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, Images, Film, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PageHeader, Empty, ErrorBox, Confirm, F, useNotify, ImageField, Thumb, MediaPicker } from '../ui';
import { SheetForm, SectionLabel, ObjList } from '../crud';
import { nn, fmtCalDate } from '../lib';

type FormT = { title: string; slug: string; type: AlbumType; description: string; coverImage: string; eventDate: string; items: AlbumItem[] };
const blank = (): FormT => ({ title: '', slug: '', type: 'photo', description: '', coverImage: '', eventDate: '', items: [] });

export default function AlbumsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const [type, setType] = useState<AlbumType | 'all'>('all');
  const params: ListAlbumsParams = { type: type === 'all' ? undefined : type };
  const { data, isLoading, error, refetch } = useListAlbums(params, { query: { queryKey: getListAlbumsQueryKey(params) } });
  const create = useCreateAlbum();
  const update = useUpdateAlbum();
  const del = useDeleteAlbum();
  const [edit, setEdit] = useState<Album | 'new' | null>(null);
  const [f, setF] = useState<FormT>(blank());
  const [pick, setPick] = useState(false);
  const set = <K extends keyof FormT>(k: K, v: FormT[K]) => setF((p) => ({ ...p, [k]: v }));
  const inv = () => qc.invalidateQueries({ queryKey: getListAlbumsQueryKey() });

  const open = (a: Album | 'new') => {
    setEdit(a);
    setF(a === 'new' ? blank() : { title: a.title, slug: a.slug, type: a.type, description: a.description ?? '', coverImage: a.coverImage ?? '', eventDate: a.eventDate ?? '', items: a.items });
  };
  const submit = () => {
    const body: AlbumInput = { title: f.title.trim(), slug: f.slug.trim() || undefined, type: f.type, description: nn(f.description), coverImage: nn(f.coverImage), eventDate: nn(f.eventDate), items: f.items.filter((i) => i.url.trim()).map((i) => ({ ...i, thumbnailUrl: i.thumbnailUrl || null, caption: i.caption || null })) };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu album', body.title); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, o); else if (edit) update.mutate({ id: edit.id, data: body }, o);
  };

  return (
    <div>
      <PageHeader eyebrow="Truyền thông" title="Thư viện ảnh, video" desc="Album sự kiện, hội thảo và video giới thiệu hiển thị ở mục Thư viện."
        actions={<Button onClick={() => open('new')} data-testid="button-new-album"><Plus className="h-4 w-4 mr-1" />Tạo album</Button>} />
      <div className="flex rounded-md border border-border bg-card p-0.5 w-fit mb-4">
        {(['all', 'photo', 'video'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={cn('px-3 h-8 rounded text-[12.5px]', type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')} data-testid={`tab-album-${t}`}>
            {t === 'all' ? 'Tất cả' : t === 'photo' ? 'Ảnh' : 'Video'}
          </button>
        ))}
      </div>
      {isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
        : error ? <ErrorBox error={error} onRetry={() => refetch()} />
        : !data?.length ? <div className="bg-card border border-card-border rounded-md"><Empty icon={<Images className="h-5 w-5" />} title="Chưa có album" action={<Button variant="outline" onClick={() => open('new')}>Tạo album đầu tiên</Button>} /></div>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((a) => (
              <div key={a.id} className="group bg-card border border-card-border rounded-md overflow-hidden shadow-sm" data-testid={`card-album-${a.id}`}>
                <button className="relative block w-full" onClick={() => open(a)}>
                  <Thumb src={a.coverImage ?? a.items[0]?.thumbnailUrl ?? a.items[0]?.url} className="w-full aspect-[4/3]" />
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-sidebar/85 text-sidebar-foreground text-[11px] px-1.5 py-0.5">
                    {a.type === 'video' ? <Film className="h-3 w-3" /> : <Camera className="h-3 w-3" />}<span className="adm-num">{a.itemCount}</span>
                  </span>
                </button>
                <div className="p-3 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold line-clamp-2">{a.title}</div>
                    <div className="text-[11.5px] text-muted-foreground">{fmtCalDate(a.eventDate)}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open(a)} data-testid={`button-edit-album-${a.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Confirm title={`Xóa album “${a.title}”?`} desc="Tệp ảnh/video gốc không bị xóa."
                    onConfirm={() => del.mutate({ id: a.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa album'); }, onError: (e) => notify.fail(e) })}
                    trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} />
                </div>
              </div>
            ))}
          </div>
        )}

      <SheetForm open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit === 'new' ? 'Tạo album' : 'Sửa album'} onSubmit={submit}
        saving={create.isPending || update.isPending} canSubmit={!!f.title.trim()}>
        <F label="Tên album" required><Input value={f.title} onChange={(e) => set('title', e.target.value)} data-testid="input-album-title" /></F>
        <div className="grid sm:grid-cols-3 gap-3">
          <F label="Loại"><Select value={f.type} onValueChange={(v) => set('type', v as AlbumType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="photo">Ảnh</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></F>
          <F label="Ngày sự kiện"><Input type="date" value={f.eventDate} onChange={(e) => set('eventDate', e.target.value)} /></F>
          <F label="Đường dẫn"><Input value={f.slug} onChange={(e) => set('slug', e.target.value)} className="adm-mono" placeholder="tự sinh" /></F>
        </div>
        <F label="Mô tả"><Textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={2} /></F>
        <F label="Ảnh bìa"><ImageField value={f.coverImage} onChange={(v) => set('coverImage', v)} testId="input-album-cover" /></F>
        <SectionLabel>Nội dung album ({f.items.length})</SectionLabel>
        <Button type="button" size="sm" variant="outline" onClick={() => setPick(true)}><Images className="h-3.5 w-3.5 mr-1" />Thêm từ thư viện media</Button>
        <ObjList value={f.items as AlbumItem[]} onChange={(v) => set('items', v)} testId="list-album-items" addLabel="Thêm bằng đường dẫn"
          blank={(): AlbumItem => ({ type: f.type, url: '', thumbnailUrl: null, caption: null })}
          render={(it, p) => (
            <div className="flex gap-2">
              <Thumb src={it.type === 'photo' ? it.url : it.thumbnailUrl} kind={it.type === 'video' && !it.thumbnailUrl ? 'video' : 'image'} className="h-14 w-20 rounded border border-border shrink-0" />
              <div className="flex-1 grid gap-1.5">
                <div className="grid grid-cols-[90px_1fr] gap-1.5">
                  <Select value={it.type} onValueChange={(v) => p({ type: v as AlbumType })}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="photo">Ảnh</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select>
                  <Input className="h-8 adm-mono text-[12px]" value={it.url} onChange={(e) => p({ url: e.target.value })} placeholder={it.type === 'video' ? 'https://youtube.com/…' : '/images/…'} />
                </div>
                {it.type === 'video' && <Input className="h-8 adm-mono text-[12px]" value={it.thumbnailUrl ?? ''} onChange={(e) => p({ thumbnailUrl: e.target.value })} placeholder="Ảnh thu nhỏ" />}
                <Input className="h-8" value={it.caption ?? ''} onChange={(e) => p({ caption: e.target.value })} placeholder="Chú thích" />
              </div>
            </div>
          )} />
        <MediaPicker open={pick} onOpenChange={setPick} type={f.type === 'video' ? 'video' : 'image'}
          onPick={(url, title) => set('items', [...f.items, { type: f.type, url, thumbnailUrl: null, caption: title }])} />
      </SheetForm>
    </div>
  );
}
