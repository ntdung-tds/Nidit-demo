import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListPublications, useCreatePublication, useUpdatePublication, useDeletePublication, useListFields, useListProjects, getListPublicationsQueryKey, getListProjectsQueryKey } from '@workspace/api-client-react';
import type { Publication, PublicationInput, PublicationType, ListPublicationsParams } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, BookOpen, Globe2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, useNotify, Chip, Pager, SearchBox, TagInput } from '../ui';
import { SheetForm } from '../crud';
import { nn } from '../lib';

const PUB_TYPE: Record<PublicationType, string> = { journal: 'Tạp chí', conference: 'Hội nghị', book: 'Sách', report: 'Báo cáo', patent: 'Sáng chế' };
type FormT = { title: string; authors: string; venue: string; type: PublicationType; year: string; doi: string; url: string; abstract: string; keywords: string[]; indexing: string; isInternational: boolean; citationCount: string; fieldId: string; projectId: string };
const blank = (): FormT => ({ title: '', authors: '', venue: '', type: 'journal', year: String(new Date().getFullYear()), doi: '', url: '', abstract: '', keywords: [], indexing: '', isInternational: false, citationCount: '0', fieldId: 'none', projectId: 'none' });

export default function PublicationsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const fields = useListFields();
  const projParams = { page: 1, pageSize: 100 };
  const projects = useListProjects(projParams, { query: { queryKey: getListProjectsQueryKey(projParams) } });
  const [q, setQ] = useState('');
  const [type, setType] = useState<PublicationType | 'all'>('all');
  const [year, setYear] = useState('all');
  const [page, setPage] = useState(1);
  const params: ListPublicationsParams = { page, pageSize: 20, q: q || undefined, type: type === 'all' ? undefined : type, year: year === 'all' ? undefined : Number(year) };
  const { data, isLoading, error, refetch } = useListPublications(params, { query: { queryKey: getListPublicationsQueryKey(params), placeholderData: (p) => p } });
  const create = useCreatePublication();
  const update = useUpdatePublication();
  const del = useDeletePublication();
  const [edit, setEdit] = useState<Publication | 'new' | null>(null);
  const [f, setF] = useState<FormT>(blank());
  const set = <K extends keyof FormT>(k: K, v: FormT[K]) => setF((p) => ({ ...p, [k]: v }));
  const inv = () => qc.invalidateQueries({ queryKey: getListPublicationsQueryKey() });

  const open = (p: Publication | 'new') => {
    setEdit(p);
    setF(p === 'new' ? blank() : { title: p.title, authors: p.authors, venue: p.venue, type: p.type, year: String(p.year), doi: p.doi ?? '', url: p.url ?? '', abstract: p.abstract, keywords: p.keywords, indexing: p.indexing ?? '', isInternational: p.isInternational, citationCount: String(p.citationCount), fieldId: p.fieldId ? String(p.fieldId) : 'none', projectId: p.projectId ? String(p.projectId) : 'none' });
  };
  const submit = () => {
    const body: PublicationInput = { title: f.title.trim(), authors: f.authors.trim(), venue: f.venue.trim(), type: f.type, year: Number(f.year), doi: nn(f.doi), url: nn(f.url), abstract: f.abstract, keywords: f.keywords, indexing: nn(f.indexing), isInternational: f.isInternational, citationCount: Number(f.citationCount) || 0, fieldId: f.fieldId === 'none' ? null : Number(f.fieldId), projectId: f.projectId === 'none' ? null : Number(f.projectId) };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu công bố'); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, o); else if (edit) update.mutate({ id: edit.id, data: body }, o);
  };

  return (
    <div>
      <PageHeader eyebrow="Nghiên cứu" title="Công bố khoa học" desc="Bài báo, báo cáo hội nghị, sách chuyên khảo và sáng chế của cán bộ Viện."
        actions={<Button onClick={() => open('new')} data-testid="button-new-publication"><Plus className="h-4 w-4 mr-1" />Thêm công bố</Button>} />
      <div className="flex flex-wrap gap-2 mb-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tên bài, tác giả…" className="w-72" />
        <Select value={type} onValueChange={(v) => { setType(v as PublicationType | 'all'); setPage(1); }}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi loại</SelectItem>{(Object.keys(PUB_TYPE) as PublicationType[]).map((t) => <SelectItem key={t} value={t}>{PUB_TYPE[t]} {data?.typeCounts.find((c) => c.status === t)?.count ?? ''}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={year} onValueChange={(v) => { setYear(v); setPage(1); }}>
          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi năm</SelectItem>{data?.years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.items.length ? (
          <Empty icon={<BookOpen className="h-5 w-5" />} title="Không có công bố" action={<Button variant="outline" onClick={() => open('new')}>Thêm công bố</Button>} />
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((p) => (
              <div key={p.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40" data-testid={`row-publication-${p.id}`}>
                <span className="adm-num text-[18px] font-semibold text-muted-foreground w-12 shrink-0">{p.year}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium adm-serif">{p.title}</div>
                  <div className="text-[12px] text-muted-foreground">{p.authors}</div>
                  <div className="text-[12px] italic text-foreground/70">{p.venue}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Chip tone="blue">{PUB_TYPE[p.type]}</Chip>
                    {p.isInternational && <Chip tone="green"><Globe2 className="h-2.5 w-2.5" />Quốc tế</Chip>}
                    {p.indexing && <Chip>{p.indexing}</Chip>}
                    {p.projectTitle && <Chip className="max-w-[260px] truncate">{p.projectTitle}</Chip>}
                    {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="text-[11px] adm-mono text-primary inline-flex items-center gap-0.5">{p.doi}<ExternalLink className="h-2.5 w-2.5" /></a>}
                  </div>
                </div>
                <span className="text-[11.5px] text-muted-foreground adm-num whitespace-nowrap">{p.citationCount} trích dẫn</span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => open(p)} data-testid={`button-edit-publication-${p.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                <Confirm title="Xóa công bố này?" desc={p.title}
                  onConfirm={() => del.mutate({ id: p.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa công bố'); }, onError: (e) => notify.fail(e) })}
                  trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} />
              </div>
            ))}
          </div>
        )}
        {data && data.totalPages > 0 && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
      </div>

      <SheetForm open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit === 'new' ? 'Thêm công bố' : 'Sửa công bố'} onSubmit={submit}
        saving={create.isPending || update.isPending} canSubmit={!!(f.title.trim() && f.authors.trim() && f.venue.trim() && Number(f.year))}>
        <F label="Tiêu đề" required><Textarea value={f.title} onChange={(e) => set('title', e.target.value)} rows={2} data-testid="input-pub-title" /></F>
        <F label="Tác giả" required hint="Ngăn cách bằng dấu phẩy"><Input value={f.authors} onChange={(e) => set('authors', e.target.value)} data-testid="input-pub-authors" /></F>
        <F label="Nơi công bố" required><Input value={f.venue} onChange={(e) => set('venue', e.target.value)} data-testid="input-pub-venue" /></F>
        <div className="grid sm:grid-cols-3 gap-3">
          <F label="Loại"><Select value={f.type} onValueChange={(v) => set('type', v as PublicationType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(PUB_TYPE) as PublicationType[]).map((t) => <SelectItem key={t} value={t}>{PUB_TYPE[t]}</SelectItem>)}</SelectContent></Select></F>
          <F label="Năm" required><Input type="number" value={f.year} onChange={(e) => set('year', e.target.value)} /></F>
          <F label="Số trích dẫn"><Input type="number" value={f.citationCount} onChange={(e) => set('citationCount', e.target.value)} /></F>
          <F label="DOI"><Input value={f.doi} onChange={(e) => set('doi', e.target.value)} className="adm-mono" placeholder="10.xxxx/…" /></F>
          <F label="Chỉ mục"><Input value={f.indexing} onChange={(e) => set('indexing', e.target.value)} placeholder="Scopus, ISI…" /></F>
          <F label="Quốc tế"><label className="flex items-center gap-2 h-9 text-[13px]"><Switch checked={f.isInternational} onCheckedChange={(v) => set('isInternational', v)} />Công bố quốc tế</label></F>
          <F label="Đường dẫn" className="sm:col-span-3"><Input value={f.url} onChange={(e) => set('url', e.target.value)} className="adm-mono" /></F>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Lĩnh vực"><Select value={f.fieldId} onValueChange={(v) => set('fieldId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Không gắn</SelectItem>{fields.data?.map((x) => <SelectItem key={x.id} value={String(x.id)}>{x.name}</SelectItem>)}</SelectContent></Select></F>
          <F label="Thuộc đề tài"><Select value={f.projectId} onValueChange={(v) => set('projectId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Không gắn</SelectItem>{projects.data?.items.map((x) => <SelectItem key={x.id} value={String(x.id)}>{x.code} · {x.title.slice(0, 50)}</SelectItem>)}</SelectContent></Select></F>
        </div>
        <F label="Tóm tắt"><Textarea value={f.abstract} onChange={(e) => set('abstract', e.target.value)} rows={5} /></F>
        <F label="Từ khóa"><TagInput value={f.keywords} onChange={(v) => set('keywords', v)} testId="input-pub-keywords" /></F>
      </SheetForm>
    </div>
  );
}
