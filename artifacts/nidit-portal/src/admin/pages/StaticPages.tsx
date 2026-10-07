import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListAdminPages, useGetAdminPage, useCreateStaticPage, useUpdateStaticPage, useDeleteStaticPage, getListAdminPagesQueryKey, getGetAdminPageQueryKey,
} from '@workspace/api-client-react';
import type { StaticPage, PageStatus } from '@workspace/api-client-react';
import { ArrowLeft, FileStack, Loader2, Plus, Save, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, Panel, RichEditor, useNotify, Chip, SearchBox } from '../ui';
import { BASE, fmtDateTime, fromNow, nn } from '../lib';

export function PagesList() {
  const { data, isLoading, error, refetch } = useListAdminPages();
  const [, navigate] = useLocation();
  const [q, setQ] = useState('');
  const list = (data ?? []).filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader eyebrow="Nội dung" title="Trang tĩnh" desc="Giới thiệu, chức năng nhiệm vụ, liên hệ… — các trang ít thay đổi, có bản tiếng Anh."
        actions={<Button asChild data-testid="button-new-page"><Link href="/quan-tri/trang-tinh/moi"><Plus className="h-4 w-4 mr-1" />Thêm trang</Link></Button>} />
      <SearchBox value={q} onChange={setQ} className="w-72 mb-3" placeholder="Tìm trang…" />
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !list.length ? (
          <Empty icon={<FileStack className="h-5 w-5" />} title="Chưa có trang tĩnh" action={<Button variant="outline" onClick={() => navigate('/quan-tri/trang-tinh/moi')}>Tạo trang</Button>} />
        ) : (
          <div className="divide-y divide-border">
            {list.map((p) => (
              <Link key={p.id} href={`/quan-tri/trang-tinh/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50" data-testid={`row-page-${p.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{p.title}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate"><span className="adm-mono">/{p.slug}</span>{p.titleEn ? ` · EN: ${p.titleEn}` : ' · chưa có bản tiếng Anh'}</div>
                </div>
                {p.status === 'published' ? <span className="st st-published">Đã xuất bản</span> : <span className="st st-draft">Nháp</span>}
                <div className="text-[12px] text-muted-foreground w-44 text-right hidden md:block">{fromNow(p.updatedAt)}{p.updatedByName ? ` · ${p.updatedByName}` : ''}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type FormT = { title: string; titleEn: string; slug: string; summary: string; content: string; contentEn: string; status: PageStatus; seoTitle: string; seoDescription: string };
const blank: FormT = { title: '', titleEn: '', slug: '', summary: '', content: '', contentEn: '', status: 'draft', seoTitle: '', seoDescription: '' };
const from = (p: StaticPage): FormT => ({ title: p.title, titleEn: p.titleEn ?? '', slug: p.slug, summary: p.summary ?? '', content: p.content, contentEn: p.contentEn ?? '', status: p.status, seoTitle: p.seoTitle ?? '', seoDescription: p.seoDescription ?? '' });

export function PageEditor({ id }: { id?: number }) {
  const isNew = !id;
  const qc = useQueryClient();
  const notify = useNotify();
  const [, navigate] = useLocation();
  const { data, isLoading, error, refetch } = useGetAdminPage(id ?? 0, { query: { enabled: !!id, queryKey: getGetAdminPageQueryKey(id ?? 0) } });
  const create = useCreateStaticPage();
  const update = useUpdateStaticPage();
  const del = useDeleteStaticPage();
  const [f, setF] = useState<FormT>(blank);
  const [k, setK] = useState(0);
  const [dirty, setDirty] = useState(false);
  const init = useRef<number | null>(null);
  useEffect(() => { if (data && init.current !== data.id) { init.current = data.id; setF(from(data)); setK((x) => x + 1); setDirty(false); } }, [data]);
  const set = <K extends keyof FormT>(key: K, v: FormT[K]) => { setF((p) => ({ ...p, [key]: v })); setDirty(true); };

  const save = () => {
    const body = { title: f.title.trim(), titleEn: nn(f.titleEn), slug: f.slug.trim() || undefined, summary: nn(f.summary), content: f.content, contentEn: nn(f.contentEn.replace(/^<p><\/p>$/, '')), status: f.status, seoTitle: nn(f.seoTitle), seoDescription: nn(f.seoDescription) };
    const done = () => qc.invalidateQueries({ queryKey: getListAdminPagesQueryKey() });
    if (isNew) create.mutate({ data: body }, { onSuccess: (p) => { done(); notify.ok('Đã tạo trang', p.title); navigate(`/quan-tri/trang-tinh/${p.id}`); }, onError: (e) => notify.fail(e) });
    else update.mutate({ id: id!, data: body }, { onSuccess: (p) => { done(); qc.setQueryData(getGetAdminPageQueryKey(id!), p); setDirty(false); notify.ok('Đã lưu trang', fmtDateTime(p.updatedAt)); }, onError: (e) => notify.fail(e) });
  };

  if (!isNew && isLoading) return <div className="space-y-3"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96" /></div>;
  if (!isNew && (error || !data)) return <ErrorBox error={error} onRetry={() => refetch()} />;
  const saving = create.isPending || update.isPending;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild><Link href="/quan-tri/trang-tinh"><ArrowLeft className="h-4 w-4 mr-1" />Trang tĩnh</Link></Button>
        <span className="text-[13px] font-medium">{isNew ? 'Trang mới' : data!.title}</span>
        {!isNew && data!.status === 'published' && <a href={`${BASE}${data!.slug}`} target="_blank" rel="noreferrer" className="text-[12px] text-primary inline-flex items-center gap-1">Xem<ExternalLink className="h-3 w-3" /></a>}
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-[12px] text-[hsl(32_90%_32%)]">Có thay đổi chưa lưu</span>}
          {!isNew && (
            <Confirm title="Xóa trang này?" desc="Trang sẽ không còn truy cập được trên trang công khai."
              onConfirm={() => del.mutate({ id: id! }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListAdminPagesQueryKey() }); notify.ok('Đã xóa trang'); navigate('/quan-tri/trang-tinh'); }, onError: (e) => notify.fail(e) })}
              trigger={<Button variant="ghost" size="sm" className="text-destructive" data-testid="button-delete-page"><Trash2 className="h-4 w-4 mr-1" />Xóa</Button>} />
          )}
          <Button size="sm" onClick={save} disabled={!f.title.trim() || saving} data-testid="button-save-page">{saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}Lưu</Button>
        </div>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <Tabs defaultValue="vi">
          <TabsList><TabsTrigger value="vi">Tiếng Việt</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
          <TabsContent value="vi" className="space-y-3">
            <Input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Tiêu đề trang" className="adm-serif text-[20px] h-12 font-semibold" data-testid="input-page-title" />
            <Textarea value={f.summary} onChange={(e) => set('summary', e.target.value)} placeholder="Mô tả ngắn" rows={2} data-testid="input-page-summary" />
            <RichEditor value={f.content} onChange={(v) => set('content', v)} resetKey={`vi-${k}`} />
          </TabsContent>
          <TabsContent value="en" className="space-y-3">
            <Input value={f.titleEn} onChange={(e) => set('titleEn', e.target.value)} placeholder="Page title (English)" className="adm-serif text-[20px] h-12 font-semibold" data-testid="input-page-title-en" />
            <RichEditor value={f.contentEn} onChange={(v) => set('contentEn', v)} resetKey={`en-${k}`} placeholder="English content…" />
          </TabsContent>
        </Tabs>
        <div className="space-y-4 lg:pt-11">
          <Panel title="Xuất bản" bodyClass="p-4 space-y-3">
            <label className="flex items-center justify-between text-[13px]">
              <span>{f.status === 'published' ? <span className="st st-published">Đã xuất bản</span> : <span className="st st-draft">Nháp</span>}</span>
              <Switch checked={f.status === 'published'} onCheckedChange={(v) => set('status', v ? 'published' : 'draft')} data-testid="switch-page-status" />
            </label>
            <F label="Đường dẫn" hint="Bỏ trống để tự sinh"><Input value={f.slug} onChange={(e) => set('slug', e.target.value)} className="adm-mono" data-testid="input-page-slug" /></F>
            {!isNew && <div className="text-[11.5px] text-muted-foreground">Cập nhật {fmtDateTime(data!.updatedAt)}{data!.updatedByName ? ` bởi ${data!.updatedByName}` : ''}</div>}
          </Panel>
          <Panel title="SEO" bodyClass="p-4 space-y-3">
            <F label="Tiêu đề SEO" hint={`${f.seoTitle.length}/60`}><Input value={f.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /></F>
            <F label="Mô tả SEO" hint={`${f.seoDescription.length}/160`}><Textarea value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} rows={3} /></F>
            {!f.titleEn && <Chip tone="amber">Chưa có bản tiếng Anh</Chip>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
