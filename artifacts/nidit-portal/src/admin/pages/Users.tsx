import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListUsers, useCreateUser, useUpdateUser, getListUsersQueryKey } from '@workspace/api-client-react';
import type { User, UserRole } from '@workspace/api-client-react';
import { Plus, Pencil, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMe } from '../auth';
import { PageHeader, Empty, ErrorBox, RowsSkeleton, F, useNotify, Chip, Confirm } from '../ui';
import { ROLE_LABEL, fromNow, initials } from '../lib';

const ROLE_DESC: Record<UserRole, string> = { admin: 'Toàn quyền, kể cả người dùng, cấu hình, sao lưu', editor: 'Soạn và quản lý nội dung, gửi duyệt bài', reviewer: 'Duyệt, yêu cầu sửa và xuất bản bài viết' };
type FormT = { fullName: string; email: string; role: UserRole; title: string; unit: string; isActive: boolean };

export default function UsersPage() {
  const me = useMe();
  const qc = useQueryClient();
  const notify = useNotify();
  const { data, isLoading, error, refetch } = useListUsers();
  const create = useCreateUser();
  const update = useUpdateUser();
  const [edit, setEdit] = useState<User | 'new' | null>(null);
  const [f, setF] = useState<FormT>({ fullName: '', email: '', role: 'editor', title: '', unit: '', isActive: true });
  const inv = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const open = (u: User | 'new') => {
    setEdit(u);
    setF(u === 'new' ? { fullName: '', email: '', role: 'editor', title: '', unit: '', isActive: true } : { fullName: u.fullName, email: u.email, role: u.role, title: u.title, unit: u.unit, isActive: u.isActive });
  };
  const submit = () => {
    const base = { fullName: f.fullName.trim(), email: f.email.trim(), role: f.role, title: f.title, unit: f.unit };
    const o = { onSuccess: () => { inv(); setEdit(null); notify.ok('Đã lưu người dùng', base.fullName); }, onError: (e: unknown) => notify.fail(e) };
    if (edit === 'new') create.mutate({ data: base }, o); else if (edit) update.mutate({ id: edit.id, data: { ...base, isActive: f.isActive } }, o);
  };
  const toggle = (u: User) => update.mutate({ id: u.id, data: { isActive: !u.isActive } }, { onSuccess: () => { inv(); notify.ok(u.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', u.fullName); }, onError: (e) => notify.fail(e) });

  return (
    <div>
      <PageHeader eyebrow="Hệ thống" title="Người dùng" desc="Tài khoản khu quản trị và phân quyền theo vai trò."
        actions={<Button onClick={() => open('new')} data-testid="button-new-user"><Plus className="h-4 w-4 mr-1" />Thêm người dùng</Button>} />
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
          <div key={r} className="bg-card border border-card-border rounded-md p-3 shadow-sm">
            <div className="flex items-center justify-between"><span className="font-semibold text-[13px]">{ROLE_LABEL[r]}</span><span className="adm-num text-[20px] font-semibold">{data?.filter((u) => u.role === r).length ?? '–'}</span></div>
            <div className="text-[11.5px] text-muted-foreground">{ROLE_DESC[r]}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-card-border rounded-md shadow-sm overflow-hidden">
        {isLoading ? <RowsSkeleton /> : error ? <div className="p-4"><ErrorBox error={error} onRetry={() => refetch()} /></div> : !data?.length ? (
          <Empty icon={<UsersIcon className="h-5 w-5" />} title="Chưa có người dùng" />
        ) : (
          <div className="divide-y divide-border">
            {data.map((u) => (
              <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${u.isActive ? '' : 'opacity-60'}`} data-testid={`row-user-${u.id}`}>
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-[12px] font-semibold">{initials(u.fullName)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium flex items-center gap-2">{u.fullName}{u.id === me.id && <Chip tone="blue">Bạn</Chip>}{!u.isActive && <Chip tone="red">Đã khóa</Chip>}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{u.email}{u.title ? ` · ${u.title}` : ''}{u.unit ? ` · ${u.unit}` : ''}</div>
                </div>
                <Chip tone={u.role === 'admin' ? 'red' : u.role === 'reviewer' ? 'amber' : 'muted'}>{ROLE_LABEL[u.role]}</Chip>
                <span className="text-[11.5px] text-muted-foreground w-32 text-right hidden md:block">{u.lastLoginAt ? `Đăng nhập ${fromNow(u.lastLoginAt)}` : 'Chưa đăng nhập'}</span>
                {u.id !== me.id && (
                  <Confirm title={u.isActive ? `Khóa tài khoản ${u.fullName}?` : `Mở khóa ${u.fullName}?`} desc={u.isActive ? 'Người dùng sẽ không thể đăng nhập khu quản trị.' : undefined}
                    confirmLabel={u.isActive ? 'Khóa' : 'Mở khóa'} destructive={u.isActive} onConfirm={() => toggle(u)}
                    trigger={<Button size="sm" variant="ghost" className={u.isActive ? 'text-destructive' : ''} data-testid={`button-toggle-user-${u.id}`}>{u.isActive ? 'Khóa' : 'Mở khóa'}</Button>} />
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => open(u)} data-testid={`button-edit-user-${u.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit === 'new' ? 'Thêm người dùng' : 'Sửa người dùng'}</DialogTitle>
            {edit === 'new' && <DialogDescription>Người dùng mới đăng nhập bằng email tại trang đăng nhập quản trị.</DialogDescription>}
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Họ và tên" required><Input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} data-testid="input-user-name" /></F>
            <F label="Email" required><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} data-testid="input-user-email" /></F>
            <F label="Chức danh"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></F>
            <F label="Đơn vị"><Input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></F>
            <F label="Vai trò" className="sm:col-span-2" hint={ROLE_DESC[f.role]}>
              <Select value={f.role} onValueChange={(v) => setF({ ...f, role: v as UserRole })} disabled={edit !== 'new' && edit?.id === me.id}>
                <SelectTrigger data-testid="select-user-role"><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}</SelectContent>
              </Select>
            </F>
            {edit !== 'new' && edit?.id !== me.id && <label className="flex items-center gap-2 text-[13px]"><Switch checked={f.isActive} onCheckedChange={(v) => setF({ ...f, isActive: v })} />Đang hoạt động</label>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Hủy</Button>
            <Button onClick={submit} disabled={!f.fullName.trim() || !f.email.trim() || create.isPending || update.isPending} data-testid="button-save-user">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
