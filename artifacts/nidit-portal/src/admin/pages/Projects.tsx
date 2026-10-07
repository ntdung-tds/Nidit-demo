import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListProjects, useCreateProject, useUpdateProject, useDeleteProject, useListFields, getListProjectsQueryKey } from '@workspace/api-client-react';
import type { Project, ProjectInput, ProjectStatus, ProjectMilestone, ListProjectsParams } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, useNotify, Chip, Pager, SearchBox, TagInput, ImageField } from '../ui';
import { SheetForm, SectionLabel, StringList, ObjList } from '../crud';
import { nn, fmtCalDate } from '../lib';

export const PROJECT_STATUS: Record<ProjectStatus, string> = { proposed: 'Đề xuất', ongoing: 'Đang thực hiện', completed: 'Đã nghiệm thu' };
const tone = (s: ProjectStatus) => (s === 'ongoing' ? 'blue' : s === 'completed' ? 'green' : 'amber') as 'blue' | 'green' | 'amber';
type FormT = { title: string; slug: string; code: string; type: string; level: string; status: ProjectStatus; fieldId: string; leadName: string; leadUnit: string; startYear: string; endYear: string; budget: string; summary: string; objectives: string[]; results: string; partners: string[]; milestones: ProjectMilestone[]; keywords: string[]; coverImage: string };
const blank = (): FormT => ({ title: '', slug: '', code: '', type: 'Đề tài', level: 'Cấp Bộ', status: 'proposed', fieldId: 'none', leadName: '', leadUnit: '', startYear: String(new Date().getFullYear()), endYear: '', budget: '', summary: '', objectives: [], results: '', partners: [], milestones: [], keywords: [], coverImage: '' });

export default function ProjectsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const fields = useListFields();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const params: ListProjectsParams = { page, pageSize: 15, q: q || undefined, status: status === 'all' ? undefined : status };
  const { data, isLoading, error, refetch } = useListProjects(params, { query: { queryKey: getListProjectsQueryKey(params), placeholderData: (p) => p } });
  const create = useCreateProject();
  const update = useUpdateProject();
  const del = useDeleteProject();
  const [edit, setEdit] = useState<Project | 'new' | null>(null);
  const [f, setF] = useState<FormT>(blank());
  const set = <K extends keyof FormT>(k: K, v: FormT[K]) => setF((p) => ({ ...p, [k]: v }));
  const inv = () => qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });

  const open = (p: Project | 'new') => {
    setEdit(p);
    setF(p === 'new' ? blank() : { title: p.title, slug: p.slug, code: p.code, type: p.type, level: p.level, status: p.status, fieldId: p.fieldId ? String(p.fieldId) : 'none', leadName: p.leadName, leadUnit: p.leadUnit, startYear: String(p.startYear), endYear: p.endYear ? String(p.endYear) : '', budget: p.budget ?? '', summary: p.summary, objectives: p.objectives, results: p.results ?? '', partners: p.partners, milestones: p.milestones, keywords: p.keywords, coverImage: p.coverImage ?? '' });
  };
  const submit = () => {
    const body: ProjectInput = { title: f.title.trim(), slug: f.slug.trim() || undefined, code: f.code.trim(), type: f.type, level: f.level, status: f.status, fieldId: f.fieldId === 'none' ? null : Number(f.fieldId), leadName: f.leadName.trim(), leadUnit: f.leadUnit, startYear: Number(f.startYear), endYear: f.endYear ? Number(f.endYear) : null, budget: nn(f.budget), summary: f.summary, objectives: f.objectives.filter((x) => x.trim()), results: nn(f.results), partners: f.partners.filter((x) => x.trim()), milestones: f.milestones.filter((m) => m.title.trim()), keywords: f.keywords, coverImage: nn(f.coverImage) };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu đề tài', body.code); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, o); else if (edit) update.mutate({ id: edit.id, data: body }, o);
  };
  const cnt = (s: ProjectStatus) => data?.statusCounts.find((c) => c.status === s)?.count;

  return (
    <div>
      <PageHeader eyebrow="Nghiên cứu" title="Đề tài, dự án" desc="Nhiệm vụ khoa học công nghệ các cấp do Viện chủ trì hoặc phối hợp."
        actions={<Button onClick={() => open('new')} data-testid="button-new-project"><Plus className="h-4 w-4 mr-1" />Thêm đề tài</Button>} />
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex rounded-md border border-border bg-card p-0.5">
          {(['all', 'proposed', 'ongoing', 'completed'] as const).map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn('px-3 h-8 rounded text-[12.5px]', status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')} data-testid={`tab-project-${s}`}>
              {s === 'all' ? 'Tất cả' : PROJECT_STATUS[s]} {s !== 'all' && <span className="adm-num opacity-70">{cnt(s) ?? ''}</span>}
            </button>
          ))}
        </div>
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} className="w-64" />
      </div>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.items.length ? (
          <Empty icon={<FlaskConical className="h-5 w-5" />} title="Không có đề tài" action={<Button variant="outline" onClick={() => open('new')}>Thêm đề tài</Button>} />
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40" data-testid={`row-project-${p.id}`}>
                <span className="adm-mono text-[12px] w-28 shrink-0 text-muted-foreground">{p.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium line-clamp-1">{p.title}</div>
                  <div className="text-[11.5px] text-muted-foreground">{p.level} · {p.leadName} · {p.startYear}–{p.endYear ?? '…'}{p.fieldName ? ` · ${p.fieldName}` : ''}</div>
                </div>
                <span className="text-[11.5px] text-muted-foreground hidden md:block adm-num">{p.milestones.filter((m) => m.done).length}/{p.milestones.length} mốc</span>
                <Chip tone={tone(p.status)}>{PROJECT_STATUS[p.status]}</Chip>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => open(p)} data-testid={`button-edit-project-${p.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                <Confirm title={`Xóa đề tài ${p.code}?`} desc="Các công bố liên kết sẽ mất liên kết tới đề tài này."
                  onConfirm={() => del.mutate({ id: p.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa đề tài'); }, onError: (e) => notify.fail(e) })}
                  trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} />
              </div>
            ))}
          </div>
        )}
        {data && data.totalPages > 0 && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
      </div>

      <SheetForm open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit === 'new' ? 'Thêm đề tài, dự án' : 'Sửa đề tài, dự án'} onSubmit={submit}
        saving={create.isPending || update.isPending} canSubmit={!!(f.title.trim() && f.code.trim() && f.leadName.trim() && Number(f.startYear))}>
        <F label="Tên đề tài" required><Textarea value={f.title} onChange={(e) => set('title', e.target.value)} rows={2} data-testid="input-project-title" /></F>
        <div className="grid sm:grid-cols-3 gap-3">
          <F label="Mã số" required><Input value={f.code} onChange={(e) => set('code', e.target.value)} className="adm-mono" data-testid="input-project-code" /></F>
          <F label="Loại"><Input value={f.type} onChange={(e) => set('type', e.target.value)} /></F>
          <F label="Cấp"><Input value={f.level} onChange={(e) => set('level', e.target.value)} /></F>
          <F label="Trạng thái"><Select value={f.status} onValueChange={(v) => set('status', v as ProjectStatus)}><SelectTrigger data-testid="select-project-status"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => <SelectItem key={s} value={s}>{PROJECT_STATUS[s]}</SelectItem>)}</SelectContent></Select></F>
          <F label="Năm bắt đầu" required><Input type="number" value={f.startYear} onChange={(e) => set('startYear', e.target.value)} /></F>
          <F label="Năm kết thúc"><Input type="number" value={f.endYear} onChange={(e) => set('endYear', e.target.value)} /></F>
          <F label="Chủ nhiệm" required><Input value={f.leadName} onChange={(e) => set('leadName', e.target.value)} data-testid="input-project-lead" /></F>
          <F label="Đơn vị chủ trì"><Input value={f.leadUnit} onChange={(e) => set('leadUnit', e.target.value)} /></F>
          <F label="Kinh phí"><Input value={f.budget} onChange={(e) => set('budget', e.target.value)} placeholder="2,85 tỷ đồng" /></F>
          <F label="Lĩnh vực" className="sm:col-span-2"><Select value={f.fieldId} onValueChange={(v) => set('fieldId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Không gắn</SelectItem>{fields.data?.map((x) => <SelectItem key={x.id} value={String(x.id)}>{x.name}</SelectItem>)}</SelectContent></Select></F>
          <F label="Đường dẫn"><Input value={f.slug} onChange={(e) => set('slug', e.target.value)} className="adm-mono" placeholder="tự sinh" /></F>
        </div>
        <F label="Tóm tắt"><Textarea value={f.summary} onChange={(e) => set('summary', e.target.value)} rows={4} /></F>
        <F label="Kết quả đạt được"><Textarea value={f.results} onChange={(e) => set('results', e.target.value)} rows={3} /></F>
        <F label="Từ khóa"><TagInput value={f.keywords} onChange={(v) => set('keywords', v)} testId="input-project-keywords" /></F>
        <F label="Ảnh đại diện"><ImageField value={f.coverImage} onChange={(v) => set('coverImage', v)} testId="input-project-cover" /></F>
        <SectionLabel>Mục tiêu</SectionLabel>
        <StringList value={f.objectives} onChange={(v) => set('objectives', v)} placeholder="Mục tiêu…" testId="list-objectives" />
        <SectionLabel>Đơn vị phối hợp</SectionLabel>
        <StringList value={f.partners} onChange={(v) => set('partners', v)} placeholder="Tên đơn vị" testId="list-partners" />
        <SectionLabel>Mốc tiến độ</SectionLabel>
        <ObjList value={f.milestones as ProjectMilestone[]} onChange={(v) => set('milestones', v)} testId="list-milestones" addLabel="Thêm mốc"
          blank={(): ProjectMilestone => ({ title: '', date: new Date().toISOString().slice(0, 7), done: false })}
          render={(m, p) => (
            <div className="grid grid-cols-[1fr_130px_auto] gap-2 items-center">
              <Input value={m.title} onChange={(e) => p({ title: e.target.value })} placeholder="Nội dung mốc" />
              <Input type="month" value={m.date} onChange={(e) => p({ date: e.target.value })} title={fmtCalDate(m.date)} />
              <label className="flex items-center gap-1.5 text-[12px] whitespace-nowrap"><Checkbox checked={m.done} onCheckedChange={(v) => p({ done: !!v })} />Hoàn thành</label>
            </div>
          )} />
      </SheetForm>
    </div>
  );
}
