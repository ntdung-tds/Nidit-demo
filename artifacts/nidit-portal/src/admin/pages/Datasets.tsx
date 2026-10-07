import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListDatasets, useCreateDataset, useUpdateDataset, useDeleteDataset, useListFields, getListDatasetsQueryKey } from '@workspace/api-client-react';
import type { Dataset, DatasetInput, AccessLevel, AccessMethodType, DatasetAccessMethod, DatasetColumn, ListDatasetsParams } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, useNotify, Chip, SearchBox, TagInput, ImageField, Thumb } from '../ui';
import { SheetForm, SectionLabel, ObjList } from '../crud';
import { fmtNum, nn } from '../lib';

const ACCESS: Record<AccessLevel, string> = { open: 'Mở', registered: 'Cần đăng ký', restricted: 'Hạn chế' };
const METHOD: Record<AccessMethodType, string> = { link: 'Tải trực tiếp', api: 'API', object_storage: 'Object Storage' };
type FormT = Omit<DatasetInput, 'fieldId' | 'recordCount' | 'coverImage'> & { fieldId: string; recordCount: string; coverImage: string };
const blank = (): FormT => ({ title: '', slug: '', summary: '', description: '', fieldId: 'none', publisher: 'NIDIT', contactEmail: '', license: 'CC BY 4.0', accessLevel: 'open', accessMethods: [], formats: [], sizeLabel: '', recordCount: '0', language: 'vi', updateFrequency: '', version: '1.0', keywords: [], aiTasks: [], conditions: '', columns: [], coverImage: '', issuedDate: '' });

export default function DatasetsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const fields = useListFields();
  const [q, setQ] = useState('');
  const [lvl, setLvl] = useState<AccessLevel | 'all'>('all');
  const params: ListDatasetsParams = { q: q || undefined, accessLevel: lvl === 'all' ? undefined : lvl };
  const { data, isLoading, error, refetch } = useListDatasets(params, { query: { queryKey: getListDatasetsQueryKey(params) } });
  const create = useCreateDataset();
  const update = useUpdateDataset();
  const del = useDeleteDataset();
  const [edit, setEdit] = useState<Dataset | 'new' | null>(null);
  const [f, setF] = useState<FormT>(blank());
  const set = <K extends keyof FormT>(k: K, v: FormT[K]) => setF((p) => ({ ...p, [k]: v }));
  const inv = () => qc.invalidateQueries({ queryKey: getListDatasetsQueryKey() });

  const open = (d: Dataset | 'new') => {
    setEdit(d);
    setF(d === 'new' ? blank() : {
      title: d.title, slug: d.slug, summary: d.summary, description: d.description, fieldId: d.fieldId ? String(d.fieldId) : 'none', publisher: d.publisher, contactEmail: d.contactEmail, license: d.license,
      accessLevel: d.accessLevel, accessMethods: d.accessMethods, formats: d.formats, sizeLabel: d.sizeLabel, recordCount: String(d.recordCount), language: d.language, updateFrequency: d.updateFrequency,
      version: d.version, keywords: d.keywords, aiTasks: d.aiTasks, conditions: d.conditions, columns: d.columns, coverImage: d.coverImage ?? '', issuedDate: d.issuedDate,
    });
  };
  const submit = () => {
    const body: DatasetInput = { ...f, slug: f.slug?.trim() || undefined, fieldId: f.fieldId === 'none' ? null : Number(f.fieldId), recordCount: Number(f.recordCount) || 0, coverImage: nn(f.coverImage), issuedDate: f.issuedDate || undefined,
      accessMethods: (f.accessMethods ?? []).map((m) => ({ ...m, note: m.note ? m.note : null })) };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu bộ dữ liệu', body.title); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, o); else if (edit) update.mutate({ id: edit.id, data: body }, o);
  };

  return (
    <div>
      <PageHeader eyebrow="Nội dung" title="Dữ liệu AI" desc="Danh mục bộ dữ liệu phục vụ nghiên cứu, huấn luyện và đánh giá mô hình AI."
        actions={<Button onClick={() => open('new')} data-testid="button-new-dataset"><Plus className="h-4 w-4 mr-1" />Thêm bộ dữ liệu</Button>} />
      <div className="flex flex-wrap gap-2 mb-3">
        <SearchBox value={q} onChange={setQ} className="w-72" />
        <Select value={lvl} onValueChange={(v) => setLvl(v as AccessLevel | 'all')}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi mức truy cập</SelectItem>{(Object.keys(ACCESS) as AccessLevel[]).map((a) => <SelectItem key={a} value={a}>{ACCESS[a]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.length ? (
          <Empty icon={<Database className="h-5 w-5" />} title="Chưa có bộ dữ liệu" action={<Button variant="outline" onClick={() => open('new')}>Thêm bộ dữ liệu</Button>} />
        ) : (
          <div className="divide-y divide-border">
            {data.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40" data-testid={`row-dataset-${d.id}`}>
                <Thumb src={d.coverImage} className="h-12 w-16 rounded border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{d.title}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{d.fieldName ?? 'Chưa gắn lĩnh vực'} · {fmtNum(d.recordCount)} bản ghi · {d.sizeLabel} · v{d.version}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Chip tone={d.accessLevel === 'open' ? 'green' : d.accessLevel === 'registered' ? 'amber' : 'red'}>{ACCESS[d.accessLevel]}</Chip>
                    {d.formats.map((x) => <Chip key={x}>{x}</Chip>)}
                    {d.accessMethods.map((m, i) => <Chip key={i} tone="blue">{METHOD[m.type]}</Chip>)}
                  </div>
                </div>
                <div className="text-right text-[12px] text-muted-foreground adm-num hidden md:block"><div>{fmtNum(d.downloadCount)} lượt tải</div><div>{fmtNum(d.requestCount)} yêu cầu</div></div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => open(d)} data-testid={`button-edit-dataset-${d.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                <Confirm title={`Xóa “${d.title}”?`} desc="Bộ dữ liệu sẽ bị gỡ khỏi danh mục công khai."
                  onConfirm={() => del.mutate({ id: d.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa bộ dữ liệu'); }, onError: (e) => notify.fail(e) })}
                  trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} />
              </div>
            ))}
          </div>
        )}
      </div>

      <SheetForm open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit === 'new' ? 'Thêm bộ dữ liệu' : 'Sửa bộ dữ liệu'} onSubmit={submit}
        saving={create.isPending || update.isPending} canSubmit={!!(f.title.trim() && f.summary.trim())}>
        <F label="Tên bộ dữ liệu" required><Input value={f.title} onChange={(e) => set('title', e.target.value)} data-testid="input-dataset-title" /></F>
        <F label="Tóm tắt" required><Textarea value={f.summary} onChange={(e) => set('summary', e.target.value)} rows={2} data-testid="input-dataset-summary" /></F>
        <F label="Mô tả chi tiết (HTML)"><Textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={4} className="adm-mono text-[12px]" /></F>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Đường dẫn" hint="Bỏ trống để tự sinh"><Input value={f.slug} onChange={(e) => set('slug', e.target.value)} className="adm-mono" /></F>
          <F label="Lĩnh vực"><Select value={f.fieldId} onValueChange={(v) => set('fieldId', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Không gắn</SelectItem>{fields.data?.map((x) => <SelectItem key={x.id} value={String(x.id)}>{x.name}</SelectItem>)}</SelectContent></Select></F>
          <F label="Mức truy cập"><Select value={f.accessLevel} onValueChange={(v) => set('accessLevel', v as AccessLevel)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(ACCESS) as AccessLevel[]).map((a) => <SelectItem key={a} value={a}>{ACCESS[a]}</SelectItem>)}</SelectContent></Select></F>
          <F label="Giấy phép"><Input value={f.license} onChange={(e) => set('license', e.target.value)} /></F>
          <F label="Đơn vị công bố"><Input value={f.publisher} onChange={(e) => set('publisher', e.target.value)} /></F>
          <F label="Email liên hệ"><Input value={f.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></F>
          <F label="Số bản ghi"><Input type="number" value={f.recordCount} onChange={(e) => set('recordCount', e.target.value)} /></F>
          <F label="Dung lượng"><Input value={f.sizeLabel} onChange={(e) => set('sizeLabel', e.target.value)} placeholder="2,4 GB" /></F>
          <F label="Ngôn ngữ"><Input value={f.language} onChange={(e) => set('language', e.target.value)} /></F>
          <F label="Tần suất cập nhật"><Input value={f.updateFrequency} onChange={(e) => set('updateFrequency', e.target.value)} placeholder="Hằng quý" /></F>
          <F label="Phiên bản"><Input value={f.version} onChange={(e) => set('version', e.target.value)} /></F>
          <F label="Ngày công bố"><Input type="date" value={f.issuedDate} onChange={(e) => set('issuedDate', e.target.value)} /></F>
        </div>
        <F label="Định dạng"><TagInput value={f.formats ?? []} onChange={(v) => set('formats', v)} placeholder="CSV, JSON, Parquet…" testId="input-dataset-formats" /></F>
        <F label="Từ khóa"><TagInput value={f.keywords ?? []} onChange={(v) => set('keywords', v)} testId="input-dataset-keywords" /></F>
        <F label="Bài toán AI phù hợp"><TagInput value={f.aiTasks ?? []} onChange={(v) => set('aiTasks', v)} placeholder="Phân loại văn bản, NER…" testId="input-dataset-aitasks" /></F>
        <F label="Ảnh đại diện"><ImageField value={f.coverImage} onChange={(v) => set('coverImage', v)} testId="input-dataset-cover" /></F>
        <SectionLabel>Phương thức truy cập</SectionLabel>
        <ObjList value={(f.accessMethods ?? []) as DatasetAccessMethod[]} onChange={(v) => set('accessMethods', v)} testId="list-access" addLabel="Thêm phương thức"
          blank={(): DatasetAccessMethod => ({ type: 'link', label: '', url: '', note: null })}
          render={(m, p) => (
            <div className="grid sm:grid-cols-[150px_1fr] gap-2">
              <Select value={m.type} onValueChange={(v) => p({ type: v as AccessMethodType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(METHOD) as AccessMethodType[]).map((t) => <SelectItem key={t} value={t}>{METHOD[t]}</SelectItem>)}</SelectContent></Select>
              <Input value={m.label} onChange={(e) => p({ label: e.target.value })} placeholder="Nhãn hiển thị" />
              <Input value={m.url} onChange={(e) => p({ url: e.target.value })} placeholder={m.type === 'object_storage' ? 's3://bucket/duong-dan' : 'https://'} className="adm-mono sm:col-span-2" />
              <Input value={m.note ?? ''} onChange={(e) => p({ note: e.target.value })} placeholder="Ghi chú (không bắt buộc)" className="sm:col-span-2" />
            </div>
          )} />
        <SectionLabel>Cấu trúc dữ liệu (cột)</SectionLabel>
        <ObjList value={(f.columns ?? []) as DatasetColumn[]} onChange={(v) => set('columns', v)} testId="list-columns" addLabel="Thêm cột"
          blank={(): DatasetColumn => ({ name: '', type: 'string', description: '' })}
          render={(c, p) => (
            <div className="grid grid-cols-[1fr_110px] gap-2">
              <Input value={c.name} onChange={(e) => p({ name: e.target.value })} placeholder="Tên cột" className="adm-mono" />
              <Input value={c.type} onChange={(e) => p({ type: e.target.value })} placeholder="Kiểu" className="adm-mono" />
              <Input value={c.description} onChange={(e) => p({ description: e.target.value })} placeholder="Mô tả" className="col-span-2" />
            </div>
          )} />
        <SectionLabel>Điều kiện sử dụng</SectionLabel>
        <Textarea value={f.conditions} onChange={(e) => set('conditions', e.target.value)} rows={3} placeholder="Điều kiện truy cập / sử dụng (HTML)" className="adm-mono text-[12px]" />
      </SheetForm>
    </div>
  );
}
