import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, getListMenuItemsQueryKey } from '@workspace/api-client-react';
import type { MenuItem, MenuLocation } from '@workspace/api-client-react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, CornerDownRight, Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, Confirm, F, useNotify, Chip } from '../ui';
import { nn } from '../lib';

const LOCS: { v: MenuLocation; label: string; desc: string }[] = [
  { v: 'main', label: 'Menu chính', desc: 'Thanh điều hướng đầu trang' },
  { v: 'footer', label: 'Chân trang', desc: 'Liên kết ở cuối trang' },
  { v: 'links', label: 'Liên kết website', desc: 'Khối liên kết đến các cơ quan' },
];
type FormT = { label: string; labelEn: string; url: string; parentId: string; sortOrder: string; isVisible: boolean; openInNewTab: boolean };

export default function MenusPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const [loc, setLoc] = useState<MenuLocation>('main');
  const { data, isLoading, error, refetch } = useListMenuItems({ location: loc });
  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const del = useDeleteMenuItem();
  const [edit, setEdit] = useState<MenuItem | 'new' | null>(null);
  const [f, setF] = useState<FormT>({ label: '', labelEn: '', url: '', parentId: 'none', sortOrder: '0', isVisible: true, openInNewTab: false });
  const inv = () => qc.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });

  const roots = (data ?? []).filter((m) => !m.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const kids = (id: number) => (data ?? []).filter((m) => m.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder);

  const open = (m: MenuItem | 'new', parentId?: number) => {
    setEdit(m);
    setF(m === 'new'
      ? { label: '', labelEn: '', url: '', parentId: parentId ? String(parentId) : 'none', sortOrder: String((parentId ? kids(parentId).length : roots.length) + 1), isVisible: true, openInNewTab: false }
      : { label: m.label, labelEn: m.labelEn ?? '', url: m.url, parentId: m.parentId ? String(m.parentId) : 'none', sortOrder: String(m.sortOrder), isVisible: m.isVisible, openInNewTab: m.openInNewTab });
  };
  const submit = () => {
    const body = { label: f.label.trim(), labelEn: nn(f.labelEn), url: f.url.trim(), parentId: f.parentId === 'none' ? null : Number(f.parentId), sortOrder: Number(f.sortOrder) || 0, isVisible: f.isVisible, openInNewTab: f.openInNewTab, location: loc };
    const opts = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu mục menu', body.label); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: body }, opts); else if (edit) update.mutate({ id: edit.id, data: body }, opts);
  };
  const patch = (m: MenuItem, d: { isVisible?: boolean; sortOrder?: number }) => update.mutate({ id: m.id, data: d }, { onSuccess: () => inv(), onError: (e) => notify.fail(e) });
  const move = (list: MenuItem[], m: MenuItem, dir: -1 | 1) => {
    const i = list.findIndex((x) => x.id === m.id);
    const o = list[i + dir];
    if (!o) return;
    patch(m, { sortOrder: o.sortOrder === m.sortOrder ? m.sortOrder + dir : o.sortOrder });
    patch(o, { sortOrder: m.sortOrder });
  };

  const Row = ({ m, list, child }: { m: MenuItem; list: MenuItem[]; child?: boolean }) => (
    <div className={cn('flex items-center gap-3 px-4 py-2 hover:bg-muted/40', !m.isVisible && 'opacity-60')} data-testid={`row-menu-${m.id}`}>
      <div className="flex-1 min-w-0 flex items-center gap-1.5" style={{ paddingLeft: child ? 22 : 0 }}>
        {child && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <div className={cn('text-[13px] truncate flex items-center gap-1.5', !child && 'font-semibold')}>{m.label}{m.openInNewTab && <ExternalLink className="h-3 w-3 text-muted-foreground" />}{!m.isVisible && <Chip>Ẩn</Chip>}</div>
          <div className="text-[11.5px] text-muted-foreground truncate"><span className="adm-mono">{m.url}</span>{m.labelEn ? ` · ${m.labelEn}` : ''}</div>
        </div>
      </div>
      <Switch checked={m.isVisible} onCheckedChange={(v) => patch(m, { isVisible: v })} data-testid={`switch-menu-visible-${m.id}`} />
      <div className="flex gap-0.5">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(list, m, -1)} title="Lên"><ArrowUp className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(list, m, 1)} title="Xuống"><ArrowDown className="h-3.5 w-3.5" /></Button>
        {!child && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open('new', m.id)} title="Thêm mục con"><Plus className="h-3.5 w-3.5" /></Button>}
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => open(m)} title="Sửa" data-testid={`button-edit-menu-${m.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
        <Confirm title={`Xóa “${m.label}”?`} desc="Mục menu sẽ bị gỡ khỏi trang công khai."
          onConfirm={() => del.mutate({ id: m.id }, { onSuccess: () => { inv(); notify.ok('Đã xóa mục menu'); }, onError: (e) => notify.fail(e) })}
          trigger={<Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Xóa"><Trash2 className="h-3.5 w-3.5" /></Button>} />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader eyebrow="Cấu trúc" title="Menu" desc="Quản lý điều hướng ở ba vị trí trên trang công khai. Hỗ trợ hai cấp: mục cha và mục con."
        actions={<Button onClick={() => open('new')} data-testid="button-new-menu"><Plus className="h-4 w-4 mr-1" />Thêm mục</Button>} />
      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        <div className="flex md:flex-col gap-1">
          {LOCS.map((l) => (
            <button key={l.v} onClick={() => setLoc(l.v)} className={cn('text-left rounded-md border px-3 py-2 transition-colors flex-1', loc === l.v ? 'bg-card border-primary shadow-sm' : 'border-transparent hover:bg-card/70')} data-testid={`tab-menu-${l.v}`}>
              <div className="text-[13px] font-semibold">{l.label}</div>
              <div className="text-[11.5px] text-muted-foreground hidden md:block">{l.desc}</div>
            </button>
          ))}
        </div>
        <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
          {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !roots.length ? (
            <Empty icon={<MenuIcon className="h-5 w-5" />} title="Vị trí này chưa có mục nào" action={<Button variant="outline" onClick={() => open('new')}>Thêm mục đầu tiên</Button>} />
          ) : (
            <div className="divide-y divide-border">
              {roots.map((m) => (
                <div key={m.id} className="divide-y divide-border/60">
                  <Row m={m} list={roots} />
                  {kids(m.id).map((k, _i, arr) => <Row key={k.id} m={k} list={arr} child />)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit === 'new' ? 'Thêm mục menu' : 'Sửa mục menu'} · {LOCS.find((l) => l.v === loc)?.label}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Nhãn (tiếng Việt)" required><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} data-testid="input-menu-label" /></F>
            <F label="Nhãn (tiếng Anh)"><Input value={f.labelEn} onChange={(e) => setF({ ...f, labelEn: e.target.value })} data-testid="input-menu-label-en" /></F>
            <F label="Đường dẫn" required hint="VD: /tin-tuc hoặc https://most.gov.vn" className="sm:col-span-2"><Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} className="adm-mono" data-testid="input-menu-url" /></F>
            <F label="Mục cha">
              <Select value={f.parentId} onValueChange={(v) => setF({ ...f, parentId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Cấp gốc —</SelectItem>
                  {roots.filter((r) => edit === 'new' || r.id !== edit?.id).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
            <F label="Thứ tự"><Input type="number" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: e.target.value })} /></F>
            <label className="flex items-center gap-2 text-[13px]"><Switch checked={f.isVisible} onCheckedChange={(v) => setF({ ...f, isVisible: v })} />Hiển thị</label>
            <label className="flex items-center gap-2 text-[13px]"><Switch checked={f.openInNewTab} onCheckedChange={(v) => setF({ ...f, openInNewTab: v })} />Mở trong tab mới</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Hủy</Button>
            <Button onClick={submit} disabled={!f.label.trim() || !f.url.trim() || create.isPending || update.isPending} data-testid="button-save-menu">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
