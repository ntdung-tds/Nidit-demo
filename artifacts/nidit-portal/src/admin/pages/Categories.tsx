import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from '@workspace/api-client-react';
import type { Category } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, Eye, EyeOff, FolderTree, CornerDownRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, useNotify, Chip } from '../ui';
import { nn } from '../lib';

type Node = Category & { depth: number };
function flatten(list: Category[]): Node[] {
  const out: Node[] = [];
  const walk = (pid: number | null, depth: number) => {
    list.filter((c) => c.parentId === pid).sort((a, b) => a.sortOrder - b.sortOrder).forEach((c) => { out.push({ ...c, depth }); walk(c.id, depth + 1); });
  };
  walk(null, 0);
  const seen = new Set(out.map((o) => o.id));
  list.filter((c) => !seen.has(c.id)).forEach((c) => out.push({ ...c, depth: 0 }));
  return out;
}

type FormT = { name: string; nameEn: string; slug: string; parentId: string; description: string; sortOrder: string; isVisible: boolean };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const { data, isLoading, error, refetch } = useListCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();
  const [edit, setEdit] = useState<Category | 'new' | null>(null);
  const [f, setF] = useState<FormT>({ name: '', nameEn: '', slug: '', parentId: 'none', description: '', sortOrder: '0', isVisible: true });
  const inv = () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const open = (c: Category | 'new', parentId?: number) => {
    setEdit(c);
    setF(c === 'new'
      ? { name: '', nameEn: '', slug: '', parentId: parentId ? String(parentId) : 'none', description: '', sortOrder: String((data?.filter((x) => x.parentId === (parentId ?? null)).length ?? 0) + 1), isVisible: true }
      : { name: c.name, nameEn: c.nameEn ?? '', slug: c.slug, parentId: c.parentId ? String(c.parentId) : 'none', description: c.description ?? '', sortOrder: String(c.sortOrder), isVisible: c.isVisible });
  };
  const submit = () => {
    const body = { name: f.name.trim(), nameEn: nn(f.nameEn), slug: f.slug.trim() || undefined, parentId: f.parentId === 'none' ? null : Number(f.parentId), description: nn(f.description), sortOrder: Number(f.sortOrder) || 0, isVisible: f.isVisible };
    const opts = { onSuccess: () => { inv(); setEdit(null); notify.ok(edit === 'new' ? 'Đã thêm chuyên mục' : 'Đã lưu chuyên mục', body.name); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, opts); else if (edit) update.mutate({ id: edit.id, data: body }, opts);
  };
  const quick = (c: Category, data: { isVisible?: boolean; sortOrder?: number }) =>
    update.mutate({ id: c.id, data }, { onSuccess: () => inv(), onError: (e) => notify.fail(e) });

  const nodes = data ? flatten(data) : [];
  const swap = (n: Node, dir: -1 | 1) => {
    const sib = nodes.filter((x) => x.parentId === n.parentId);
    const i = sib.findIndex((x) => x.id === n.id);
    const o = sib[i + dir];
    if (!o) return;
    quick(n, { sortOrder: o.sortOrder === n.sortOrder ? n.sortOrder + dir : o.sortOrder });
    quick(o, { sortOrder: n.sortOrder });
  };
  const forbiddenParents = (id: number): Set<number> => {
    const s = new Set([id]);
    let changed = true;
    while (changed) { changed = false; data?.forEach((c) => { if (c.parentId && s.has(c.parentId) && !s.has(c.id)) { s.add(c.id); changed = true; } }); }
    return s;
  };
  const blocked = edit && edit !== 'new' ? forbiddenParents(edit.id) : new Set<number>();

  return (
    <div>
      <PageHeader eyebrow="Cấu trúc" title="Chuyên mục" desc="Cây chuyên mục nhiều cấp dùng để phân loại bài viết và tạo đường dẫn trên trang công khai."
        actions={<Button onClick={() => open('new')} data-testid="button-new-category"><Plus className="h-4 w-4 mr-1" />Thêm chuyên mục</Button>} />
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_180px_90px_110px_150px] gap-3 px-4 h-9 items-center border-b border-border bg-muted/50 adm-eyebrow">
          <span>Tên chuyên mục</span><span>Đường dẫn</span><span className="text-right">Bài đăng</span><span>Hiển thị</span><span className="text-right">Thao tác</span>
        </div>
        {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !nodes.length ? (
          <Empty icon={<FolderTree className="h-5 w-5" />} title="Chưa có chuyên mục" action={<Button variant="outline" onClick={() => open('new')}>Thêm chuyên mục đầu tiên</Button>} />
        ) : (
          <div className="divide-y divide-border">
            {nodes.map((n) => (
              <div key={n.id} className="grid md:grid-cols-[1fr_180px_90px_110px_150px] gap-3 px-4 py-2 items-center hover:bg-muted/40" data-testid={`row-category-${n.id}`}>
                <div className="flex items-center gap-1.5 min-w-0" style={{ paddingLeft: n.depth * 22 }}>
                  {n.depth > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <div className={n.depth === 0 ? 'font-semibold text-[13.5px]' : 'text-[13px]'}>{n.name}</div>
                    {n.nameEn && <div className="text-[11.5px] text-muted-foreground">{n.nameEn}</div>}
                  </div>
                </div>
                <span className="adm-mono text-[12px] text-muted-foreground truncate">/{n.slug}</span>
                <span className="adm-num text-right text-[13px]">{n.articleCount}</span>
                <div className="flex items-center gap-2">
                  <Switch checked={n.isVisible} onCheckedChange={(v) => quick(n, { isVisible: v })} data-testid={`switch-visible-${n.id}`} />
                  {n.isVisible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <Chip><EyeOff className="h-3 w-3" />Ẩn</Chip>}
                </div>
                <div className="flex justify-end gap-0.5">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => swap(n, -1)} title="Lên"><ArrowUp className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => swap(n, 1)} title="Xuống"><ArrowDown className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open('new', n.id)} title="Thêm mục con" data-testid={`button-add-child-${n.id}`}><Plus className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open(n)} title="Sửa" data-testid={`button-edit-category-${n.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Confirm title={`Xóa chuyên mục “${n.name}”?`} desc="Bài viết thuộc chuyên mục sẽ trở thành chưa phân loại. Máy chủ sẽ từ chối nếu chuyên mục còn mục con."
                    onConfirm={() => del.mutate({ id: n.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa chuyên mục'); }, onError: (e) => notify.fail(e) })}
                    trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Xóa" data-testid={`button-delete-category-${n.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit === 'new' ? 'Thêm chuyên mục' : 'Sửa chuyên mục'}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Tên (tiếng Việt)" required><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} data-testid="input-category-name" /></F>
            <F label="Tên (tiếng Anh)"><Input value={f.nameEn} onChange={(e) => setF({ ...f, nameEn: e.target.value })} data-testid="input-category-name-en" /></F>
            <F label="Đường dẫn" hint="Bỏ trống để tự sinh từ tên"><Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="adm-mono" data-testid="input-category-slug" /></F>
            <F label="Chuyên mục cha">
              <Select value={f.parentId} onValueChange={(v) => setF({ ...f, parentId: v })}>
                <SelectTrigger data-testid="select-parent"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Cấp gốc —</SelectItem>
                  {nodes.filter((n) => !blocked.has(n.id)).map((n) => <SelectItem key={n.id} value={String(n.id)}>{'— '.repeat(n.depth)}{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
            <F label="Thứ tự"><Input type="number" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: e.target.value })} data-testid="input-category-order" /></F>
            <F label="Hiển thị"><label className="flex items-center gap-2 h-9 text-[13px]"><Switch checked={f.isVisible} onCheckedChange={(v) => setF({ ...f, isVisible: v })} />Hiện trên trang công khai</label></F>
            <F label="Mô tả" className="sm:col-span-2"><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} /></F>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Hủy</Button>
            <Button onClick={submit} disabled={!f.name.trim() || create.isPending || update.isPending} data-testid="button-save-category">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
