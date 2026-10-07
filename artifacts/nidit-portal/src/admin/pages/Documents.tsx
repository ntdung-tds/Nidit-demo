import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, useListFields, getListDocumentsQueryKey } from '@workspace/api-client-react';
import type { DocumentItem, DocumentGroup, ListDocumentsParams, DocumentInput } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, ScrollText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, useNotify, Chip, Pager, SearchBox } from '../ui';
import { SheetForm, SectionLabel } from '../crud';
import { fmtCalDate, fmtBytes, fmtNum, nn } from '../lib';

export const DOC_GROUP: Record<DocumentGroup, string> = { legal: 'Văn bản pháp luật', direction: 'Chỉ đạo, điều hành', guidance: 'Hướng dẫn', report: 'Báo cáo', standard: 'Tiêu chuẩn', form: 'Biểu mẫu' };
type FormT = { number: string; title: string; docType: string; docGroup: DocumentGroup; issuer: string; signer: string; issuedDate: string; effectiveDate: string; fieldId: string; summary: string; fileUrl: string; fileName: string; fileSize: string; fileFormat: string };
const blank: FormT = { number: '', title: '', docType: 'Quyết định', docGroup: 'legal', issuer: '', signer: '', issuedDate: '', effectiveDate: '', fieldId: 'none', summary: '', fileUrl: '', fileName: '', fileSize: '', fileFormat: '' };

export default function DocumentsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const fields = useListFields();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<DocumentGroup | 'all'>('all');
  const [page, setPage] = useState(1);
  const params: ListDocumentsParams = { page, pageSize: 20, q: q || undefined, docGroup: group === 'all' ? undefined : group, sort: 'newest' };
  const { data, isLoading, error, refetch } = useListDocuments(params, { query: { queryKey: getListDocumentsQueryKey(params), placeholderData: (p) => p } });
  const create = useCreateDocument();
  const update = useUpdateDocument();
  const del = useDeleteDocument();
  const [edit, setEdit] = useState<DocumentItem | 'new' | null>(null);
  const [f, setF] = useState<FormT>(blank);
  const inv = () => qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
  const s = <K extends keyof FormT>(k: K) => (v: FormT[K]) => setF((p) => ({ ...p, [k]: v }));

  const open = (d: DocumentItem | 'new') => {
    setEdit(d);
    setF(d === 'new' ? blank : { number: d.number, title: d.title, docType: d.docType, docGroup: d.docGroup, issuer: d.issuer, signer: d.signer ?? '', issuedDate: d.issuedDate, effectiveDate: d.effectiveDate ?? '', fieldId: d.fieldId ? String(d.fieldId) : 'none', summary: d.summary ?? '', fileUrl: d.fileUrl ?? '', fileName: d.fileName ?? '', fileSize: d.fileSize ? String(d.fileSize) : '', fileFormat: d.fileFormat ?? '' });
  };
  const submit = () => {
    const body: DocumentInput = { number: f.number.trim(), title: f.title.trim(), docType: f.docType.trim(), docGroup: f.docGroup, issuer: f.issuer.trim(), signer: nn(f.signer), issuedDate: f.issuedDate, effectiveDate: nn(f.effectiveDate), fieldId: f.fieldId === 'none' ? null : Number(f.fieldId), summary: nn(f.summary), fileUrl: nn(f.fileUrl), fileName: nn(f.fileName), fileSize: f.fileSize ? Number(f.fileSize) : null, fileFormat: nn(f.fileFormat) };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu văn bản', body.number); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, o); else if (edit) update.mutate({ id: edit.id, data: body }, o);
  };

  return (
    <div>
      <PageHeader eyebrow="Nội dung" title="Văn bản" desc="Hệ thống văn bản pháp luật, chỉ đạo điều hành, hướng dẫn, tiêu chuẩn và biểu mẫu."
        actions={<Button onClick={() => open('new')} data-testid="button-new-document"><Plus className="h-4 w-4 mr-1" />Thêm văn bản</Button>} />
      <div className="flex flex-wrap gap-2 mb-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Số hiệu, trích yếu…" className="w-72" />
        <Select value={group} onValueChange={(v) => { setGroup(v as DocumentGroup | 'all'); setPage(1); }}>
          <SelectTrigger className="w-52 h-9" data-testid="select-doc-group"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi nhóm</SelectItem>{(Object.keys(DOC_GROUP) as DocumentGroup[]).map((g) => <SelectItem key={g} value={g}>{DOC_GROUP[g]} {data?.facets.groups.find((x) => x.value === g) ? `(${data.facets.groups.find((x) => x.value === g)!.count})` : ''}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[150px_1fr_160px_100px_80px_80px] gap-3 px-4 h-9 items-center border-b border-border bg-muted/50 adm-eyebrow">
          <span>Số / ký hiệu</span><span>Trích yếu</span><span>Cơ quan ban hành</span><span>Ngày ban hành</span><span className="text-right">Tải</span><span />
        </div>
        {isLoading ? <RowsSkeleton cols={5} /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.items.length ? (
          <Empty icon={<ScrollText className="h-5 w-5" />} title="Không có văn bản" action={<Button variant="outline" onClick={() => open('new')}>Thêm văn bản</Button>} />
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((d) => (
              <div key={d.id} className="grid md:grid-cols-[150px_1fr_160px_100px_80px_80px] gap-x-3 gap-y-1 px-4 py-2.5 items-center hover:bg-muted/40" data-testid={`row-document-${d.id}`}>
                <span className="adm-mono text-[12.5px] font-medium">{d.number}</span>
                <div className="min-w-0">
                  <div className="text-[13px] line-clamp-2">{d.title}</div>
                  <div className="flex gap-1 mt-0.5"><Chip tone="blue">{d.docType}</Chip><Chip>{DOC_GROUP[d.docGroup]}</Chip>{d.fileUrl && <Chip tone="green"><FileDown className="h-2.5 w-2.5" />{d.fileFormat ?? 'Tệp'} {fmtBytes(d.fileSize)}</Chip>}</div>
                </div>
                <span className="text-[12.5px] truncate">{d.issuer}</span>
                <span className="text-[12.5px] adm-num">{fmtCalDate(d.issuedDate)}</span>
                <span className="text-[12px] adm-num text-right text-muted-foreground">{fmtNum(d.downloadCount)}</span>
                <div className="flex justify-end gap-0.5">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open(d)} data-testid={`button-edit-document-${d.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Confirm title={`Xóa văn bản ${d.number}?`} desc="Văn bản sẽ bị gỡ khỏi trang công khai."
                    onConfirm={() => del.mutate({ id: d.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa văn bản'); }, onError: (e) => notify.fail(e) })}
                    trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} />
                </div>
              </div>
            ))}
          </div>
        )}
        {data && data.totalPages > 0 && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
      </div>

      <SheetForm open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit === 'new' ? 'Thêm văn bản' : 'Sửa văn bản'} onSubmit={submit}
        saving={create.isPending || update.isPending} canSubmit={!!(f.number.trim() && f.title.trim() && f.issuer.trim() && f.issuedDate)}>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Số / ký hiệu" required><Input value={f.number} onChange={(e) => s('number')(e.target.value)} className="adm-mono" placeholder="123/QĐ-BKHCN" data-testid="input-doc-number" /></F>
          <F label="Loại văn bản" required><Input value={f.docType} onChange={(e) => s('docType')(e.target.value)} placeholder="Quyết định, Thông tư…" data-testid="input-doc-type" /></F>
          <F label="Trích yếu" required className="sm:col-span-2"><Textarea value={f.title} onChange={(e) => s('title')(e.target.value)} rows={2} data-testid="input-doc-title" /></F>
          <F label="Nhóm">
            <Select value={f.docGroup} onValueChange={(v) => s('docGroup')(v as DocumentGroup)}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(DOC_GROUP) as DocumentGroup[]).map((g) => <SelectItem key={g} value={g}>{DOC_GROUP[g]}</SelectItem>)}</SelectContent></Select>
          </F>
          <F label="Lĩnh vực">
            <Select value={f.fieldId} onValueChange={s('fieldId')}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Không gắn</SelectItem>{fields.data?.map((x) => <SelectItem key={x.id} value={String(x.id)}>{x.name}</SelectItem>)}</SelectContent></Select>
          </F>
          <F label="Cơ quan ban hành" required><Input value={f.issuer} onChange={(e) => s('issuer')(e.target.value)} data-testid="input-doc-issuer" /></F>
          <F label="Người ký"><Input value={f.signer} onChange={(e) => s('signer')(e.target.value)} /></F>
          <F label="Ngày ban hành" required><Input type="date" value={f.issuedDate} onChange={(e) => s('issuedDate')(e.target.value)} data-testid="input-doc-issued" /></F>
          <F label="Ngày hiệu lực"><Input type="date" value={f.effectiveDate} onChange={(e) => s('effectiveDate')(e.target.value)} /></F>
          <F label="Tóm tắt" className="sm:col-span-2"><Textarea value={f.summary} onChange={(e) => s('summary')(e.target.value)} rows={3} /></F>
        </div>
        <SectionLabel>Tệp đính kèm</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Đường dẫn tệp" className="sm:col-span-2" hint="Đăng ký tệp ở Thư viện media rồi dán đường dẫn"><Input value={f.fileUrl} onChange={(e) => s('fileUrl')(e.target.value)} className="adm-mono" data-testid="input-doc-file" /></F>
          <F label="Tên tệp"><Input value={f.fileName} onChange={(e) => s('fileName')(e.target.value)} /></F>
          <div className="grid grid-cols-2 gap-2">
            <F label="Định dạng"><Input value={f.fileFormat} onChange={(e) => s('fileFormat')(e.target.value)} placeholder="PDF" /></F>
            <F label="Dung lượng (byte)"><Input type="number" value={f.fileSize} onChange={(e) => s('fileSize')(e.target.value)} /></F>
          </div>
        </div>
      </SheetForm>
    </div>
  );
}
