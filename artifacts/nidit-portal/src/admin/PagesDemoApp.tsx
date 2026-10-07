import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart3, BookOpen, CheckCircle2, Clock3, Database, ExternalLink, FileStack, FlaskConical,
  FolderOpen, FolderTree, HardDriveDownload, History, Images, Inbox, LayoutDashboard, LogOut,
  Menu as MenuIcon, Newspaper, PanelLeft, Rss, ScrollText, Settings, ShieldCheck, Users, X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'nidit_crm_demo_session_v1';
const BASE = import.meta.env.BASE_URL;

type Item = {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  features: string[];
};

type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: 'Bàn làm việc',
    items: [
      { key: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, desc: 'Theo dõi nhanh tình trạng nội dung, yêu cầu, RSS và hoạt động hệ thống.', features: ['Chỉ số tổng quan', 'Việc cần xử lý', 'Hoạt động gần đây'] },
      { key: 'bai-viet', label: 'Bài viết', icon: Newspaper, desc: 'Soạn thảo và quản lý toàn bộ vòng đời bài viết.', features: ['Nháp', 'Gửi duyệt', 'Phê duyệt', 'Xuất bản', 'Hẹn giờ đăng'] },
      { key: 'tin-tu-dong', label: 'Tin tự động (RSS)', icon: Rss, desc: 'Thu thập tin từ nguồn chính thống vào hàng chờ biên tập.', features: ['Tối đa 5 nguồn', 'Hàng chờ RSS', 'Nhập thành nháp', 'Không tự xuất bản'] },
      { key: 'yeu-cau', label: 'Yêu cầu từ công chúng', icon: Inbox, desc: 'Tiếp nhận và theo dõi các yêu cầu gửi từ trang công khai.', features: ['Liên hệ', 'Yêu cầu dữ liệu', 'Đăng ký đánh giá', 'Trạng thái xử lý'] },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { key: 'trang-tinh', label: 'Trang tĩnh', icon: FileStack, desc: 'Quản lý các trang giới thiệu, chức năng, liên hệ và nội dung cố định.', features: ['Soạn trang', 'SEO', 'Xuất bản'] },
      { key: 'van-ban', label: 'Văn bản', icon: ScrollText, desc: 'Quản lý kho văn bản và tài liệu công khai.', features: ['Phân loại', 'Cơ quan ban hành', 'Tệp đính kèm', 'Tra cứu'] },
      { key: 'du-lieu', label: 'Dữ liệu AI', icon: Database, desc: 'Quản lý danh mục bộ dữ liệu phục vụ nghiên cứu và trí tuệ nhân tạo.', features: ['Metadata', 'Mức truy cập', 'Định dạng', 'Yêu cầu cấp quyền'] },
      { key: 'de-tai', label: 'Đề tài, dự án', icon: FlaskConical, desc: 'Theo dõi nhiệm vụ khoa học và công nghệ, đề tài và dự án.', features: ['Mã nhiệm vụ', 'Chủ nhiệm', 'Tiến độ', 'Kết quả'] },
      { key: 'cong-bo', label: 'Công bố khoa học', icon: BookOpen, desc: 'Quản lý bài báo, hội nghị, báo cáo và các công bố khoa học.', features: ['Tác giả', 'Năm công bố', 'Tạp chí/Hội nghị', 'Chỉ mục'] },
      { key: 'thu-vien', label: 'Thư viện ảnh, video', icon: Images, desc: 'Tổ chức album ảnh và video theo sự kiện.', features: ['Album', 'Ảnh', 'Video', 'Ảnh đại diện'] },
      { key: 'media', label: 'Thư viện media', icon: FolderOpen, desc: 'Quản lý tệp dùng chung trong bài viết và các trang.', features: ['Ảnh', 'Tệp tài liệu', 'Video', 'Tìm kiếm'] },
    ],
  },
  {
    title: 'Cấu trúc & báo cáo',
    items: [
      { key: 'chuyen-muc', label: 'Chuyên mục', icon: FolderTree, desc: 'Tổ chức cây chuyên mục và cấu trúc phân loại nội dung.', features: ['Cây chuyên mục', 'Thứ tự', 'Ẩn/hiện'] },
      { key: 'menu', label: 'Menu', icon: MenuIcon, desc: 'Cấu hình menu chính, footer và liên kết website.', features: ['Menu chính', 'Footer', 'Liên kết ngoài'] },
      { key: 'thong-ke', label: 'Thống kê truy cập', icon: BarChart3, desc: 'Theo dõi lượt truy cập và nội dung được quan tâm.', features: ['Hôm nay', 'Theo tháng', 'Bài đọc nhiều', 'Nguồn truy cập'] },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { key: 'nguoi-dung', label: 'Người dùng & vai trò', icon: Users, desc: 'Quản lý tài khoản và phân quyền theo vai trò.', features: ['Quản trị', 'Biên tập', 'Duyệt nội dung'] },
      { key: 'nhat-ky', label: 'Nhật ký hoạt động', icon: History, desc: 'Theo dõi lịch sử thao tác để phục vụ kiểm tra và truy vết.', features: ['Người thao tác', 'Hành động', 'Thời gian', 'Đối tượng'] },
      { key: 'sao-luu', label: 'Sao lưu dữ liệu', icon: HardDriveDownload, desc: 'Theo dõi và thực hiện các bản sao lưu hệ thống.', features: ['Lịch sao lưu', 'Tải bản sao', 'Khôi phục'] },
      { key: 'cau-hinh', label: 'Cấu hình trang', icon: Settings, desc: 'Cấu hình thông tin Viện, liên hệ, SEO và các tham số hiển thị.', features: ['Thông tin chung', 'Liên hệ', 'SEO', 'Thông báo demo'] },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="adm-root min-h-[100dvh] grid bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative overflow-hidden bg-sidebar px-7 py-9 text-sidebar-foreground sm:px-10 lg:px-14">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(hsl(40_30%_90%)_1px,transparent_1px),linear-gradient(90deg,hsl(40_30%_90%)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative flex items-center gap-3">
          <img src={`${BASE}logo-nidit.svg`} alt="" className="h-10 w-10 rounded bg-[hsl(40_30%_97%)] p-1" />
          <div className="leading-tight">
            <div className="font-bold tracking-wider text-sidebar-accent-foreground">NIDIT</div>
            <div className="text-[11px] text-sidebar-foreground/60">Viện Công nghệ số và Chuyển đổi số quốc gia</div>
          </div>
        </div>
        <div className="relative mt-16 max-w-lg lg:mt-28">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-primary">Hệ thống quản trị nội dung</div>
          <h1 className="font-display text-[36px] leading-[1.08] text-sidebar-accent-foreground sm:text-[44px]">Bàn biên tập<br />Trang thông tin điện tử</h1>
          <p className="mt-5 text-[14px] leading-relaxed text-sidebar-foreground/75">Bản demo CRM hoạt động độc lập trên GitHub Pages để trình diễn đầy đủ menu chức năng ngay cả khi máy chủ API đang tạm dừng.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
            {['Nháp', 'Chờ duyệt', 'Đã duyệt', 'Xuất bản'].map((s, i) => (
              <div key={s} className="border-t border-sidebar-foreground/25 pt-2">
                <span className={cn('mb-2 block h-2.5 w-2.5 rounded-full border-2', i === 3 ? 'border-sidebar-primary bg-sidebar-primary' : 'border-sidebar-foreground/50')} />
                <span className="text-sidebar-foreground/80">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10 adm-paper">
        <div className="w-full max-w-md">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Đăng nhập demo</div>
          <h2 className="mt-1 font-display text-[30px] font-semibold text-foreground">Truy cập CRM quản trị</h2>
          <div className="mt-5 rounded-md border border-[hsl(40_70%_78%)] bg-[hsl(42_92%_93%)] p-4 text-[13px] leading-relaxed text-[hsl(32_70%_26%)]">
            <strong>Không cần mật khẩu.</strong> Đây là tài khoản quản trị minh họa, chỉ dùng để xem giao diện và các chức năng của CRM.
          </div>
          <button onClick={onLogin} className="mt-6 flex w-full items-center justify-between rounded-md bg-primary px-4 py-3 text-left text-primary-foreground shadow-sm hover:opacity-95" data-testid="button-pages-demo-login">
            <span>
              <span className="block text-[14px] font-semibold">Quản trị viên demo</span>
              <span className="block text-[11.5px] opacity-75">Toàn quyền xem 18 nhóm chức năng</span>
            </span>
            <ShieldCheck className="h-5 w-5" />
          </button>
          <a href={BASE} className="mt-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" />Trở về trang công khai</a>
        </div>
      </section>
    </div>
  );
}

function Dashboard() {
  const stats = [
    ['Bài viết', '38', '5 chờ duyệt'],
    ['Tin RSS', '12', '5 tin mới'],
    ['Yêu cầu', '7', '3 chưa xử lý'],
    ['Người dùng', '6', '3 vai trò'],
  ];
  return (
    <div>
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tổng quan</div>
        <h1 className="mt-1 font-display text-[26px] font-semibold">Bàn làm việc quản trị</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Dữ liệu dưới đây là dữ liệu minh họa để trình diễn giao diện CRM.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, hint]) => (
          <div key={label} className="rounded-md border border-border bg-card p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{hint}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3 text-[13px] font-semibold">Việc cần xử lý</div>
          <div className="divide-y divide-border">
            {[
              ['5 bài viết đang chờ duyệt', 'Mở mục Bài viết để xem và phê duyệt.'],
              ['5 tin mới từ nguồn RSS', 'Kiểm tra hàng chờ trước khi nhập thành bản nháp.'],
              ['3 yêu cầu mới từ công chúng', 'Phân công và cập nhật trạng thái xử lý.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3 px-4 py-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div><div className="text-[13px] font-medium">{title}</div><div className="mt-0.5 text-[11.5px] text-muted-foreground">{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="text-[13px] font-semibold">Quy trình biên tập</div>
          <div className="mt-4 space-y-3">
            {['Nháp', 'Chờ duyệt', 'Đã duyệt', 'Xuất bản'].map((s, i) => (
              <div key={s} className="flex items-center gap-3 text-[12.5px]"><CheckCircle2 className={cn('h-4 w-4', i < 3 ? 'text-primary' : 'text-muted-foreground')} /><span>{s}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePage({ item }: { item: Item }) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Chức năng CRM</div>
          <h1 className="mt-1 font-display text-[26px] font-semibold">{item.label}</h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(158_60%_34%)]" />Sẵn sàng trình diễn</span>
      </div>
      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 text-[13px] font-semibold">Các chức năng chính</div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {item.features.map((f) => (
            <div key={f} className="bg-card p-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div className="mt-2 text-[13px] font-medium">{f}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">Có trong thiết kế CRM; dữ liệu trên bản GitHub Pages là dữ liệu demo, không ghi vào hệ thống thật.</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-md border border-dashed border-border bg-secondary/30 p-4 text-[12px] leading-relaxed text-muted-foreground">
        Khi triển khai máy chủ chính thức, màn hình này sử dụng API và cơ sở dữ liệu thật. Bản demo hiện ưu tiên cho việc trình bày giao diện, luồng nghiệp vụ và danh mục chức năng.
      </div>
    </div>
  );
}

export default function PagesDemoApp() {
  const [location, navigate] = useLocation();
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentKey = location.split('/')[2] || 'dashboard';
  const current = useMemo(() => ALL_ITEMS.find((i) => i.key === currentKey) ?? ALL_ITEMS[0], [currentKey]);

  const login = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setLoggedIn(true);
    navigate('/quan-tri/dashboard');
  };
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setLoggedIn(false);
    setMobileOpen(false);
    navigate('/quan-tri');
  };

  if (!loggedIn) return <Login onLogin={login} />;

  const nav = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={`${BASE}logo-nidit.svg`} alt="" className="h-8 w-8 rounded bg-[hsl(40_30%_97%)] p-0.5" />
        <div className="min-w-0 leading-tight"><div className="text-[15px] font-bold tracking-wide text-sidebar-accent-foreground">NIDIT</div><div className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">CRM demo</div></div>
        <button className="ml-auto text-sidebar-foreground md:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="adm-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-2.5 py-3 overscroll-contain touch-pan-y">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">{g.title}</div>
            {g.items.map((item) => {
              const active = current.key === item.key;
              return (
                <Link key={item.key} href={`/quan-tri/${item.key}`} onClick={() => setMobileOpen(false)} className={cn('relative flex h-8 items-center gap-2.5 rounded px-2 text-[13px] transition-colors', active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground')}>
                  {active && <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r bg-sidebar-primary" />}
                  <item.icon className="h-[15px] w-[15px] shrink-0 opacity-80" /><span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <a href={BASE} className="mb-2 flex items-center gap-2 px-1 text-[12px] text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"><ExternalLink className="h-3.5 w-3.5" />Trang công khai</a>
        <div className="flex items-center gap-2 rounded bg-sidebar-accent/70 p-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">QT</div>
          <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[12.5px] font-medium text-sidebar-accent-foreground">Quản trị viên demo</div><div className="text-[11px] text-sidebar-foreground/60">Toàn quyền</div></div>
          <button onClick={logout} className="p-1 text-sidebar-foreground/70 hover:text-sidebar-primary" title="Đăng xuất"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="adm-root adm-paper min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] bg-sidebar md:block">{nav}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="h-[100dvh] w-[min(82vw,280px)] overflow-hidden bg-sidebar">{nav}</div>
          <button className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Đóng" />
        </div>
      )}
      <div className="relative z-10 min-w-0 md:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><PanelLeft className="h-5 w-5" /></button>
          <div className="min-w-0 truncate text-[12px] text-muted-foreground">NIDIT <span className="mx-1.5 opacity-40">/</span><span className="font-medium text-foreground">CRM quản trị demo</span></div>
          <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(158_60%_34%)]" />Đã đăng nhập</div>
        </header>
        <main className="min-w-0 max-w-[1440px] px-4 py-6 md:px-6">{current.key === 'dashboard' ? <Dashboard /> : <FeaturePage item={current} />}</main>
      </div>
    </div>
  );
}
