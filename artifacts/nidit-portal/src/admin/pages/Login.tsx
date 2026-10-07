import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useListDemoAccounts, useLogin } from '@workspace/api-client-react';
import type { User, UserRole } from '@workspace/api-client-react';
import { ArrowRight, ExternalLink, Info, Loader2, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { setAdminToken } from '@/lib/admin-token';
import { cn } from '@/lib/utils';
import { BASE, ROLE_LABEL, initials, fromNow } from '../lib';
import { ErrorBox, useNotify } from '../ui';

const ROLE_DESC: Record<UserRole, string> = {
  admin: 'Cấu hình trang, người dùng, chuyên mục, sao lưu và toàn bộ nội dung.',
  editor: 'Soạn bài, cập nhật văn bản, dữ liệu, đề tài, thư viện và gửi duyệt.',
  reviewer: 'Duyệt, yêu cầu chỉnh sửa, xuất bản và gỡ bài.',
};
const ROLE_ORDER: UserRole[] = ['editor', 'reviewer', 'admin'];
const FLOW = ['Nháp', 'Chờ duyệt', 'Đã duyệt', 'Xuất bản'];

export default function LoginPage() {
  const { data, isLoading, error, refetch } = useListDemoAccounts();
  const login = useLogin();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const notify = useNotify();
  const [picked, setPicked] = useState<number | null>(null);

  const go = (u: User) => {
    setPicked(u.id);
    login.mutate({ data: { userId: u.id } }, {
      onSuccess: (s) => {
        setAdminToken(s.token);
        qc.clear();
        notify.ok(`Xin chào, ${s.user.fullName}`, `Đăng nhập với vai trò ${ROLE_LABEL[s.user.role]}.`);
        navigate('/quan-tri/dashboard');
      },
      onError: (e) => { setPicked(null); notify.fail(e, 'Đăng nhập không thành công'); },
    });
  };

  return (
    <div className="adm-root min-h-[100dvh] grid lg:grid-cols-[1.05fr_1fr] bg-background">
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground px-8 py-10 lg:px-14 flex flex-col">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(hsl(40_30%_90%)_1px,transparent_1px),linear-gradient(90deg,hsl(40_30%_90%)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative flex items-center gap-3">
          <img src={`${BASE}logo-nidit.svg`} alt="" className="h-10 w-10 rounded bg-[hsl(40_30%_97%)] p-1" />
          <div className="leading-tight">
            <div className="font-bold tracking-wider text-sidebar-accent-foreground">NIDIT</div>
            <div className="text-[11px] text-sidebar-foreground/60">Viện Công nghệ số và Chuyển đổi số quốc gia</div>
          </div>
        </div>
        <div className="relative mt-auto pt-16 max-w-lg">
          <div className="text-[11px] uppercase tracking-[0.2em] text-sidebar-primary font-semibold mb-4">Hệ thống quản trị nội dung</div>
          <h1 className="adm-serif text-[44px] leading-[1.05] text-sidebar-accent-foreground">Bàn biên tập<br />Trang thông tin điện tử</h1>
          <p className="mt-5 text-[14px] text-sidebar-foreground/75 leading-relaxed">
            Mỗi bài viết đều có trạng thái và người phụ trách rõ ràng. Không nội dung nào được công bố khi chưa qua phê duyệt.
          </p>
          <ol className="mt-10 flex items-center gap-0">
            {FLOW.map((s, i) => (
              <li key={s} className="flex items-center">
                <div className="flex flex-col items-start">
                  <span className={cn('h-2.5 w-2.5 rounded-full border-2', i === FLOW.length - 1 ? 'bg-sidebar-primary border-sidebar-primary' : 'border-sidebar-foreground/50')} />
                  <span className="mt-2 text-[11.5px] text-sidebar-foreground/80 whitespace-nowrap">{s}</span>
                </div>
                {i < FLOW.length - 1 && <span className="w-10 sm:w-16 h-px bg-sidebar-foreground/30 mx-2 -mt-6" />}
              </li>
            ))}
          </ol>
        </div>
        <div className="relative mt-16 text-[11.5px] text-sidebar-foreground/50">Thuộc Bộ Khoa học và Công nghệ</div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 adm-paper">
        <div className="relative w-full max-w-md adm-rise">
          <div className="adm-eyebrow mb-1">Đăng nhập</div>
          <h2 className="adm-serif text-[28px] font-semibold">Chọn tài khoản làm việc</h2>
          <div className="mt-4 flex gap-2.5 rounded-md border border-[hsl(40_70%_78%)] bg-[hsl(42_92%_93%)] p-3 text-[12.5px] text-[hsl(32_70%_26%)]" data-testid="text-demo-notice">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div><strong>Đăng nhập demo, không cần mật khẩu.</strong> Đây là bản trình diễn; khi vận hành chính thức, cán bộ đăng nhập bằng tài khoản thật được cấp và xác thực đầy đủ.</div>
          </div>

          <div className="mt-6 space-y-5">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            {error && <ErrorBox error={error} onRetry={() => refetch()} />}
            {data && ROLE_ORDER.map((role) => {
              const users = data.filter((u) => u.role === role);
              if (!users.length) return null;
              return (
                <div key={role}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="text-[12px] font-semibold">{ROLE_LABEL[role]}</div>
                    <div className="text-[11px] text-muted-foreground text-right max-w-[65%] truncate">{ROLE_DESC[role]}</div>
                  </div>
                  <div className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden shadow-sm">
                    {users.map((u) => (
                      <button key={u.id} disabled={login.isPending || !u.isActive} onClick={() => go(u)}
                        className="group w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/60 transition-colors disabled:opacity-50"
                        data-testid={`button-login-${u.id}`}>
                        <Avatar className="h-9 w-9"><AvatarFallback className={cn('text-[11px] font-bold', role === 'admin' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : role === 'reviewer' ? 'bg-[hsl(158_50%_30%)] text-[hsl(40_30%_97%)]' : 'bg-primary text-primary-foreground')}>{initials(u.fullName)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0 leading-tight">
                          <div className="font-medium text-[13.5px] truncate">{u.fullName}</div>
                          <div className="text-[11.5px] text-muted-foreground truncate">{u.title}{u.unit ? ` · ${u.unit}` : ''}</div>
                          {u.lastLoginAt && <div className="text-[10.5px] text-muted-foreground/80 mt-0.5">Lần cuối {fromNow(u.lastLoginAt)}</div>}
                        </div>
                        {picked === u.id && login.isPending ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Máy chủ kiểm soát quyền theo vai trò</span>
            <a href={BASE} className="inline-flex items-center gap-1 hover:text-primary" data-testid="link-public-site-login">Trang công khai<ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      </section>
    </div>
  );
}
