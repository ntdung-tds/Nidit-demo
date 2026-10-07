import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart3, BookOpen, CheckCircle2, Clock3, Database, ExternalLink, FilePlus2, FileStack,
  FlaskConical, FolderOpen, FolderTree, HardDriveDownload, History, Images, Inbox, LayoutDashboard,
  LogOut, Menu as MenuIcon, Newspaper, PanelLeft, RefreshCw, Rss, Save, Search, ScrollText,
  Send, Settings, ShieldCheck, Trash2, Users, X, type LucideIcon,
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
  actions: string[];
};

type Group = { title: string; items: Item[] };
type DemoRow = { id: string; title: string; meta: string; status: string; updated: string };

const GROUPS: Group[] = [
  {
    title: 'Điều hành',
    items: [
      { key: 'dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard, desc: 'Trung tâm điều hành dành cho Super Admin: nội dung, người dùng, dữ liệu, RSS, yêu cầu và trạng thái hệ thống.', features: ['KPI toàn hệ thống', 'Việc cần xử lý', 'Trạng thái dịch vụ', 'Hoạt động gần đây'], actions: ['Làm mới toàn bộ'] },
      { key: 'bai-viet', label: 'Bài viết', icon: Newspaper, desc: 'Soạn thảo và quản lý toàn bộ vòng đời bài viết.', features: ['Nháp', 'Gửi duyệt', 'Phê duyệt', 'Xuất bản', 'Hẹn giờ đăng'], actions: ['Tạo bài viết', 'Gửi duyệt', 'Phê duyệt', 'Xuất bản'] },
      { key: 'phe-duyet', label: 'Duyệt nội dung', icon: CheckCircle2, desc: 'Hàng chờ phê duyệt tập trung cho bài viết, trang, văn bản và dữ liệu.', features: ['Hàng chờ duyệt', 'Duyệt/Từ chối', 'Ghi chú phê duyệt', 'Lịch sử phiên bản'], actions: ['Duyệt', 'Từ chối', 'Yêu cầu chỉnh sửa'] },
      { key: 'tin-tu-dong', label: 'Tin tự động (RSS)', icon: Rss, desc: 'Thu thập tin từ nguồn chính thống vào hàng chờ biên tập.', features: ['Quản lý nguồn', 'Lịch thu thập', 'Hàng chờ RSS', 'Nhập thành nháp'], actions: ['Thu thập ngay', 'Nhập thành nháp', 'Từ chối'] },
      { key: 'yeu-cau', label: 'Yêu cầu từ công chúng', icon: Inbox, desc: 'Tiếp nhận và theo dõi các biểu mẫu, liên hệ và yêu cầu gửi từ trang công khai.', features: ['Liên hệ', 'Yêu cầu dữ liệu', 'Đăng ký đánh giá', 'SLA xử lý'], actions: ['Phân công', 'Đang xử lý', 'Hoàn tất'] },
    ],
  },
  {
    title: 'Nội dung & dữ liệu',
    items: [
      { key: 'trang-tinh', label: 'Trang tĩnh', icon: FileStack, desc: 'Quản lý các trang giới thiệu, chức năng, liên hệ và nội dung cố định.', features: ['Soạn trang', 'SEO', 'Phiên bản', 'Xuất bản'], actions: ['Tạo trang', 'Xem trước', 'Xuất bản'] },
      { key: 'van-ban', label: 'Văn bản', icon: ScrollText, desc: 'Quản lý kho văn bản và tài liệu công khai.', features: ['Phân loại', 'Cơ quan ban hành', 'Tệp đính kèm', 'Tra cứu'], actions: ['Thêm văn bản', 'Tải tệp', 'Công khai'] },
      { key: 'du-lieu', label: 'Dữ liệu AI', icon: Database, desc: 'Quản lý danh mục bộ dữ liệu phục vụ nghiên cứu và trí tuệ nhân tạo.', features: ['Metadata', 'Mức truy cập', 'Định dạng', 'Yêu cầu cấp quyền'], actions: ['Thêm bộ dữ liệu', 'Kiểm tra metadata', 'Cấp quyền'] },
      { key: 'de-tai', label: 'Đề tài, dự án', icon: FlaskConical, desc: 'Theo dõi nhiệm vụ khoa học và công nghệ, đề tài và dự án.', features: ['Mã nhiệm vụ', 'Chủ nhiệm', 'Tiến độ', 'Kết quả'], actions: ['Tạo nhiệm vụ', 'Cập nhật tiến độ', 'Nghiệm thu'] },
      { key: 'cong-bo', label: 'Công bố khoa học', icon: BookOpen, desc: 'Quản lý bài báo, hội nghị, báo cáo và các công bố khoa học.', features: ['Tác giả', 'Năm công bố', 'Tạp chí/Hội nghị', 'Chỉ mục'], actions: ['Thêm công bố', 'Gắn tác giả', 'Công khai'] },
      { key: 'dich-vu', label: 'Đánh giá – kiểm định', icon: ShieldCheck, desc: 'Quản lý danh mục dịch vụ đánh giá, thử nghiệm, kiểm định và đăng ký từ tổ chức.', features: ['Danh mục dịch vụ', 'Hồ sơ đăng ký', 'Trạng thái xử lý', 'Kết quả'], actions: ['Thêm dịch vụ', 'Tiếp nhận hồ sơ', 'Cập nhật kết quả'] },
      { key: 'su-kien', label: 'Sự kiện – Hội thảo', icon: Clock3, desc: 'Quản lý sự kiện, hội thảo, lịch tổ chức và nội dung trình chiếu.', features: ['Lịch sự kiện', 'Địa điểm', 'Slide trang chủ', 'Đăng ký tham dự'], actions: ['Tạo sự kiện', 'Đưa lên slide', 'Đóng đăng ký'] },
      { key: 'thu-vien', label: 'Thư viện ảnh, video', icon: Images, desc: 'Tổ chức album ảnh và video theo sự kiện.', features: ['Album', 'Ảnh', 'Video', 'Ảnh đại diện'], actions: ['Tạo album', 'Tải media', 'Chọn ảnh bìa'] },
      { key: 'media', label: 'Thư viện media', icon: FolderOpen, desc: 'Quản lý tệp dùng chung trong bài viết và các trang.', features: ['Ảnh', 'Tệp tài liệu', 'Video', 'Tìm kiếm'], actions: ['Tải tệp', 'Đổi tên', 'Sao chép liên kết'] },
    ],
  },
  {
    title: 'Cấu trúc & giao diện',
    items: [
      { key: 'linh-vuc', label: 'Lĩnh vực hoạt động', icon: FolderTree, desc: 'Quản lý các lĩnh vực chuyên môn xuất hiện trên trang thông tin.', features: ['Tên lĩnh vực', 'Mô tả', 'Biểu tượng', 'Thứ tự hiển thị'], actions: ['Thêm lĩnh vực', 'Sắp xếp', 'Ẩn/hiện'] },
      { key: 'chuyen-muc', label: 'Chuyên mục', icon: FolderTree, desc: 'Tổ chức cây chuyên mục và cấu trúc phân loại nội dung.', features: ['Cây chuyên mục', 'Thứ tự', 'Ẩn/hiện'], actions: ['Thêm chuyên mục', 'Đổi thứ tự', 'Ẩn/hiện'] },
      { key: 'menu', label: 'Menu', icon: MenuIcon, desc: 'Cấu hình menu chính, menu mobile, footer và liên kết website.', features: ['Menu chính', 'Menu mobile', 'Footer', 'Liên kết ngoài'], actions: ['Thêm mục', 'Sắp xếp', 'Lưu menu'] },
      { key: 'banner', label: 'Banner & Slide', icon: Images, desc: 'Quản lý banner, ảnh nổi bật và các slide trình diễn trên trang chủ.', features: ['Banner', 'Slide sự kiện', 'Thời gian hiển thị', 'Liên kết'], actions: ['Thêm slide', 'Sắp xếp', 'Bật/Tắt'] },
      { key: 'lien-ket', label: 'Liên kết website', icon: ExternalLink, desc: 'Quản lý cổng thông tin liên quan và các liên kết đối tác.', features: ['Cổng Bộ', 'Cổng Chính phủ', 'Đối tác', 'Mở tab mới'], actions: ['Thêm liên kết', 'Kiểm tra URL', 'Sắp xếp'] },
    ],
  },
  {
    title: 'Báo cáo & giám sát',
    items: [
      { key: 'thong-ke', label: 'Thống kê truy cập', icon: BarChart3, desc: 'Theo dõi lượt truy cập và nội dung được quan tâm.', features: ['Hôm nay', 'Theo tháng', 'Bài đọc nhiều', 'Nguồn truy cập'], actions: ['Làm mới', 'Xuất CSV', 'Chọn khoảng ngày'] },
      { key: 'bao-cao-noi-dung', label: 'Báo cáo nội dung', icon: FileStack, desc: 'Tổng hợp tình trạng bài viết, xuất bản, chuyên mục và hiệu quả nội dung.', features: ['Theo trạng thái', 'Theo chuyên mục', 'Theo biên tập viên', 'Theo thời gian'], actions: ['Xuất báo cáo', 'Lọc dữ liệu'] },
      { key: 'bao-cao-yeu-cau', label: 'Báo cáo yêu cầu', icon: Inbox, desc: 'Theo dõi số lượng yêu cầu, thời gian xử lý và SLA của từng nhóm.', features: ['Mới', 'Đang xử lý', 'Hoàn tất', 'Quá hạn'], actions: ['Xuất báo cáo', 'Lọc SLA'] },
    ],
  },
  {
    title: 'Hệ thống & bảo mật',
    items: [
      { key: 'nguoi-dung', label: 'Người dùng', icon: Users, desc: 'Quản lý tài khoản, trạng thái và thông tin người dùng quản trị.', features: ['Tài khoản', 'Trạng thái', 'Đơn vị', 'Lần đăng nhập'], actions: ['Tạo tài khoản', 'Khóa tài khoản', 'Đặt lại mật khẩu'] },
      { key: 'phan-quyen', label: 'Vai trò & phân quyền', icon: ShieldCheck, desc: 'Thiết lập quyền theo vai trò và phân hệ cho toàn bộ hệ thống.', features: ['Super Admin', 'Quản trị', 'Biên tập', 'Duyệt nội dung', 'Quyền chi tiết'], actions: ['Tạo vai trò', 'Gán quyền', 'Sao chép vai trò'] },
      { key: 'nhat-ky', label: 'Nhật ký hoạt động', icon: History, desc: 'Theo dõi lịch sử thao tác để phục vụ kiểm tra và truy vết.', features: ['Người thao tác', 'Hành động', 'Thời gian', 'Đối tượng', 'IP/Phiên'], actions: ['Lọc nhật ký', 'Xuất file'] },
      { key: 'tich-hop', label: 'Tích hợp & API', icon: ExternalLink, desc: 'Quản lý kết nối API, RSS, dịch vụ ngoài và khóa tích hợp.', features: ['API nội bộ', 'RSS', 'Webhook', 'Dịch vụ ngoài'], actions: ['Kiểm tra kết nối', 'Tạo khóa demo', 'Tắt tích hợp'] },
      { key: 'sao-luu', label: 'Sao lưu & khôi phục', icon: HardDriveDownload, desc: 'Theo dõi và thực hiện các bản sao lưu hệ thống.', features: ['Lịch sao lưu', 'Bản sao dữ liệu', 'Khôi phục', 'Lưu trữ'], actions: ['Sao lưu ngay', 'Tải bản sao', 'Khôi phục demo'] },
      { key: 'trang-thai', label: 'Trạng thái hệ thống', icon: RefreshCw, desc: 'Giám sát API, cơ sở dữ liệu, scheduler, lưu trữ và các dịch vụ nền.', features: ['API', 'Database', 'RSS scheduler', 'Storage', 'Backup'], actions: ['Kiểm tra lại', 'Xem log'] },
      { key: 'cau-hinh', label: 'Cấu hình toàn hệ thống', icon: Settings, desc: 'Cấu hình thông tin Viện, liên hệ, SEO, email, thông báo và tham số vận hành.', features: ['Thông tin chung', 'Liên hệ', 'SEO', 'Email', 'Thông báo', 'Tham số hệ thống'], actions: ['Lưu cấu hình', 'Xem trước', 'Khôi phục mặc định'] },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);
const MANAGED_MODULES = ALL_ITEMS.filter((item) => item.key !== 'dashboard');

function makeRows(item: Item): DemoRow[] {
  const common: Record<string, DemoRow[]> = {
    'bai-viet': [
      { id: 'BV-038', title: 'Chuyển đổi số quốc gia: nền tảng và dữ liệu', meta: 'Tin chuyên ngành · Biên tập viên A', status: 'Chờ duyệt', updated: '08/10/2026 02:10' },
      { id: 'BV-037', title: 'Hoạt động nghiên cứu công nghệ số tháng 10', meta: 'Tin hoạt động · Biên tập viên B', status: 'Nháp', updated: '07/10/2026 22:15' },
      { id: 'BV-036', title: 'Thông báo lịch hội thảo chuyên đề', meta: 'Sự kiện – Hội thảo', status: 'Đã duyệt', updated: '07/10/2026 18:05' },
    ],
    'phe-duyet': [
      { id: 'PD-021', title: 'Bài viết: Chuyển đổi số quốc gia', meta: 'Người gửi: Biên tập viên A', status: 'Chờ duyệt', updated: '08/10/2026 02:05' },
      { id: 'PD-020', title: 'Trang giới thiệu nhiệm vụ của Viện', meta: 'Trang tĩnh', status: 'Chờ duyệt', updated: '08/10/2026 01:20' },
      { id: 'PD-019', title: 'Bộ dữ liệu tiếng Việt phục vụ AI', meta: 'Dữ liệu AI', status: 'Yêu cầu chỉnh sửa', updated: '07/10/2026 21:30' },
    ],
    'tin-tu-dong': [
      { id: 'RSS-012', title: 'Bộ KH&CN – Chuyển đổi số', meta: 'Nguồn RSS chính thống', status: 'Tin mới', updated: '08/10/2026 02:02' },
      { id: 'RSS-011', title: 'Công báo điện tử Chính phủ – Văn bản mới', meta: 'Nguồn RSS chính thống', status: 'Đã nhập nháp', updated: '08/10/2026 01:25' },
      { id: 'RSS-010', title: 'Thông tin Chính phủ', meta: 'Nguồn tổng hợp demo', status: 'Chờ xử lý', updated: '07/10/2026 23:50' },
    ],
    'yeu-cau': [
      { id: 'YC-007', title: 'Đề nghị cung cấp thông tin bộ dữ liệu AI', meta: 'Nguyễn Văn A · email@example.vn', status: 'Mới', updated: '08/10/2026 00:45' },
      { id: 'YC-006', title: 'Đăng ký dịch vụ đánh giá – kiểm định', meta: 'Doanh nghiệp B', status: 'Đang xử lý', updated: '07/10/2026 17:30' },
      { id: 'YC-005', title: 'Góp ý giao diện trang thông tin', meta: 'Khách truy cập', status: 'Hoàn tất', updated: '07/10/2026 14:20' },
    ],
    'nguoi-dung': [
      { id: 'USR-006', title: 'Quản trị viên hệ thống', meta: 'Super Admin · Phòng CNTT', status: 'Đang hoạt động', updated: '08/10/2026 01:55' },
      { id: 'USR-005', title: 'Biên tập viên A', meta: 'Biên tập nội dung', status: 'Đang hoạt động', updated: '07/10/2026 22:05' },
      { id: 'USR-004', title: 'Người duyệt B', meta: 'Duyệt nội dung', status: 'Đang hoạt động', updated: '07/10/2026 18:12' },
    ],
    'trang-thai': [
      { id: 'SYS-API', title: 'API / Gateway', meta: 'Kết nối dịch vụ backend', status: 'Hoạt động', updated: '08/10/2026 02:12' },
      { id: 'SYS-RSS', title: 'RSS Scheduler', meta: 'Lịch thu thập nguồn ngoài', status: 'Hoạt động', updated: '08/10/2026 02:10' },
      { id: 'SYS-BKP', title: 'Backup Service', meta: 'Bản sao gần nhất 01:30', status: 'Hoạt động', updated: '08/10/2026 01:30' },
    ],
  };
  if (common[item.key]) return common[item.key];
  return [
    { id: `${item.key.toUpperCase()}-03`, title: `${item.label} – bản ghi minh họa 03`, meta: item.features.slice(0, 2).join(' · '), status: 'Đang hoạt động', updated: '08/10/2026 02:00' },
    { id: `${item.key.toUpperCase()}-02`, title: `${item.label} – bản ghi minh họa 02`, meta: item.features.slice(1, 3).join(' · '), status: 'Đã cập nhật', updated: '07/10/2026 20:10' },
    { id: `${item.key.toUpperCase()}-01`, title: `${item.label} – bản ghi minh họa 01`, meta: item.features.slice(0, 3).join(' · '), status: 'Nháp demo', updated: '07/10/2026 15:25' },
  ];
}

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="adm-root grid min-h-[100dvh] bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative overflow-hidden bg-sidebar px-7 py-9 text-sidebar-foreground sm:px-10 lg:px-14">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(hsl(40_30%_90%)_1px,transparent_1px),linear-gradient(90deg,hsl(40_30%_90%)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative flex items-center gap-3">
          <img src={`${BASE}logo-nidit.svg`} alt="" className="h-10 w-10 rounded bg-[hsl(40_30%_97%)] p-1" />
          <div className="leading-tight"><div className="font-bold tracking-wider text-sidebar-accent-foreground">NIDIT</div><div className="text-[11px] text-sidebar-foreground/60">Viện Công nghệ số và Chuyển đổi số quốc gia</div></div>
        </div>
        <div className="relative mt-16 max-w-lg lg:mt-28">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-primary">Hệ thống quản trị cấp cao</div>
          <h1 className="font-display text-[36px] leading-[1.08] text-sidebar-accent-foreground sm:text-[44px]">Super Admin<br />Control Center</h1>
          <p className="mt-5 text-[14px] leading-relaxed text-sidebar-foreground/75">Dashboard quản lý toàn bộ Trang thông tin điện tử: nội dung, dữ liệu, RSS, người dùng, phân quyền, báo cáo, tích hợp, sao lưu và trạng thái hệ thống.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">{['Nội dung', 'Dữ liệu', 'Người dùng', 'Hệ thống'].map((s, i) => <div key={s} className="border-t border-sidebar-foreground/25 pt-2"><span className={cn('mb-2 block h-2.5 w-2.5 rounded-full border-2', i === 3 ? 'border-sidebar-primary bg-sidebar-primary' : 'border-sidebar-foreground/50')} /><span className="text-sidebar-foreground/80">{s}</span></div>)}</div>
        </div>
      </section>
      <section className="adm-paper flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Đăng nhập demo</div>
          <h2 className="mt-1 font-display text-[30px] font-semibold text-foreground">Truy cập Super Admin</h2>
          <div className="mt-5 rounded-md border border-[hsl(40_70%_78%)] bg-[hsl(42_92%_93%)] p-4 text-[13px] leading-relaxed text-[hsl(32_70%_26%)]"><strong>Không cần mật khẩu.</strong> Tài khoản minh họa có quyền cao nhất và truy cập toàn bộ {MANAGED_MODULES.length} phân hệ quản trị.</div>
          <button onClick={onLogin} className="mt-6 flex w-full items-center justify-between rounded-md bg-primary px-4 py-3 text-left text-primary-foreground shadow-sm hover:opacity-95"><span><span className="block text-[14px] font-semibold">Super Admin demo</span><span className="block text-[11.5px] opacity-75">Toàn quyền quản trị hệ thống</span></span><ShieldCheck className="h-5 w-5" /></button>
          <a href={BASE} className="mt-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" />Trở về trang công khai</a>
        </div>
      </section>
    </div>
  );
}

function StatusDot({ ok = true }: { ok?: boolean }) {
  return <span className={cn('h-2 w-2 shrink-0 rounded-full', ok ? 'bg-[hsl(158_60%_34%)]' : 'bg-[hsl(35_90%_52%)]')} />;
}

function Dashboard() {
  const stats = [
    ['Bài đã xuất bản', '38', '+6 tháng này'],
    ['Chờ phê duyệt', '5', 'Cần xử lý'],
    ['Tin RSS mới', '12', '5 chưa nhập'],
    ['Yêu cầu công chúng', '7', '3 đang mở'],
    ['Người dùng', '6', '4 đang hoạt động'],
    ['Phân hệ quản trị', String(MANAGED_MODULES.length), 'Super Admin toàn quyền'],
  ];
  const system = [
    ['Trang công khai', 'Hoạt động', true],
    ['API / Gateway', 'Hoạt động', true],
    ['Cơ sở dữ liệu', 'Sẵn sàng', true],
    ['RSS Scheduler', 'Chạy định kỳ', true],
    ['Lưu trữ media', 'Bình thường', true],
    ['Sao lưu', '01:30 hôm nay', true],
  ] as const;
  const queue = [
    ['5 bài viết đang chờ duyệt', '/quan-tri/phe-duyet'],
    ['5 tin RSS mới cần biên tập', '/quan-tri/tin-tu-dong'],
    ['3 yêu cầu công chúng đang mở', '/quan-tri/yeu-cau'],
    ['1 tài khoản cần rà soát quyền', '/quan-tri/phan-quyen'],
  ];
  const activity = [
    ['02:10', 'Super Admin', 'Kiểm tra trạng thái hệ thống'],
    ['02:02', 'RSS Scheduler', 'Thu thập nguồn Bộ KH&CN'],
    ['01:55', 'Quản trị viên', 'Cập nhật phân quyền người dùng'],
    ['01:30', 'Backup Service', 'Hoàn tất bản sao dữ liệu'],
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Trung tâm điều hành</span><span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Super Admin</span></div>
          <h1 className="mt-2 font-display text-[28px] font-semibold">Dashboard quản trị toàn hệ thống</h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">Một màn hình để kiểm soát nội dung, dữ liệu, người dùng, phân quyền, tích hợp, báo cáo và vận hành kỹ thuật của Trang thông tin điện tử.</p>
        </div>
        <button className="inline-flex h-9 w-fit items-center gap-2 rounded border border-border bg-card px-3 text-[12px] font-semibold"><RefreshCw className="h-3.5 w-3.5" />Làm mới toàn bộ</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map(([label, value, hint]) => <div key={label} className="rounded-md border border-border bg-card p-4 shadow-sm"><div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-2 text-3xl font-semibold">{value}</div><div className="mt-1 text-[11.5px] text-muted-foreground">{hint}</div></div>)}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><div className="text-[13px] font-semibold">Việc cần xử lý</div><div className="text-[11px] text-muted-foreground">Ưu tiên của Super Admin</div></div><Inbox className="h-4 w-4 text-primary" /></div>
          <div className="divide-y divide-border">{queue.map(([title, href]) => <Link key={title} href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40"><Clock3 className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1 text-[12.5px] font-medium">{title}</span><span className="text-[11px] text-muted-foreground">Mở →</span></Link>)}</div>
        </section>
        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3"><div className="text-[13px] font-semibold">Trạng thái hệ thống</div><div className="text-[11px] text-muted-foreground">Giám sát dịch vụ nền</div></div>
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">{system.map(([name, state, ok]) => <div key={name} className="flex items-center gap-2 px-4 py-2.5"><StatusDot ok={ok} /><span className="min-w-0 flex-1 text-[12px] font-medium">{name}</span><span className="text-[11px] text-muted-foreground">{state}</span></div>)}</div>
        </section>
      </div>

      <section className="mt-5 rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3"><div className="text-[13px] font-semibold">Toàn bộ phân hệ quản trị</div><div className="text-[11px] text-muted-foreground">Super Admin có quyền truy cập toàn bộ chức năng dưới đây.</div></div>
        <div className="p-4">
          <div className="space-y-6">{GROUPS.filter((g) => g.title !== 'Điều hành' || g.items.length > 1).map((g) => {
            const items = g.items.filter((item) => item.key !== 'dashboard');
            if (!items.length) return null;
            return <div key={g.title}><div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{g.title}</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{items.map((item) => <Link key={item.key} href={`/quan-tri/${item.key}`} className="group flex min-w-0 gap-3 rounded border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"><div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-secondary text-primary"><item.icon className="h-4 w-4" /></div><div className="min-w-0"><div className="truncate text-[12.5px] font-semibold group-hover:text-primary">{item.label}</div><div className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-muted-foreground">{item.desc}</div></div></Link>)}</div></div>;
          })}</div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3 text-[13px] font-semibold">Hoạt động gần đây</div>
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[11.5px]"><thead className="bg-secondary/50 text-muted-foreground"><tr><th className="px-4 py-2 font-semibold">Thời gian</th><th className="px-4 py-2 font-semibold">Tác nhân</th><th className="px-4 py-2 font-semibold">Hoạt động</th></tr></thead><tbody className="divide-y divide-border">{activity.map(([time, actor, action]) => <tr key={`${time}-${action}`}><td className="px-4 py-2.5 font-mono text-muted-foreground">{time}</td><td className="px-4 py-2.5 font-medium">{actor}</td><td className="px-4 py-2.5 text-muted-foreground">{action}</td></tr>)}</tbody></table></div>
        </section>
        <section className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="text-[13px] font-semibold">Quyền của tài khoản hiện tại</div>
          <div className="mt-3 rounded border border-primary/25 bg-primary/5 p-3"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><div><div className="text-[12.5px] font-bold">SUPER ADMIN</div><div className="text-[10.5px] text-muted-foreground">Toàn quyền hệ thống</div></div></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">{['Tạo/Sửa/Xóa', 'Phê duyệt/Xuất bản', 'Người dùng & quyền', 'Cấu hình hệ thống', 'Tích hợp/API', 'Sao lưu/Khôi phục'].map((p) => <div key={p} className="flex items-center gap-2 rounded border border-border px-2.5 py-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{p}</div>)}</div>
        </section>
      </div>
    </div>
  );
}

function FeatureWorkspace({ item }: { item: Item }) {
  const rows = useMemo(() => makeRows(item), [item]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [notice, setNotice] = useState('');
  const filtered = rows.filter((r) => `${r.id} ${r.title} ${r.meta} ${r.status}`.toLowerCase().includes(query.toLowerCase()));
  const selected = rows.find((r) => r.id === selectedId) ?? filtered[0];
  const demoAction = (name: string) => setNotice(`Đã mô phỏng thao tác “${name}”. Tài khoản Super Admin có quyền thực hiện thao tác này; bản GitHub Pages không ghi thay đổi vào cơ sở dữ liệu thật.`);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Phân hệ quản trị</span><span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[9.5px] font-bold uppercase text-primary">Super Admin</span></div><h1 className="mt-1 font-display text-[26px] font-semibold">{item.label}</h1><p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p></div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold"><StatusDot />Sẵn sàng trình diễn</span>
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm trong dữ liệu demo..." className="h-9 w-full rounded border border-border bg-background pl-9 pr-3 text-[12.5px] outline-none focus:border-primary" /></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => demoAction('Tạo mới')} className="inline-flex h-9 items-center gap-1.5 rounded bg-primary px-3 text-[12px] font-semibold text-primary-foreground"><FilePlus2 className="h-3.5 w-3.5" />Tạo mới</button><button onClick={() => demoAction('Làm mới')} className="inline-flex h-9 items-center gap-1.5 rounded border border-border px-3 text-[12px] font-semibold"><RefreshCw className="h-3.5 w-3.5" />Làm mới</button></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[12px]">
            <thead className="bg-secondary/60 text-muted-foreground"><tr><th className="px-4 py-2.5 font-semibold">Mã</th><th className="px-4 py-2.5 font-semibold">Nội dung</th><th className="px-4 py-2.5 font-semibold">Trạng thái</th><th className="px-4 py-2.5 font-semibold">Cập nhật</th><th className="px-4 py-2.5 font-semibold">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-border">{filtered.map((r) => <tr key={r.id} className={cn('cursor-pointer hover:bg-secondary/30', selectedId === r.id && 'bg-secondary/50')} onClick={() => setSelectedId(r.id)}><td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{r.id}</td><td className="px-4 py-3"><div className="font-medium">{r.title}</div><div className="mt-0.5 text-[11px] text-muted-foreground">{r.meta}</div></td><td className="px-4 py-3"><span className="rounded-full border border-border bg-background px-2 py-1 text-[10.5px] font-semibold">{r.status}</span></td><td className="px-4 py-3 text-muted-foreground">{r.updated}</td><td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={(e) => { e.stopPropagation(); demoAction('Sửa'); }} className="rounded border border-border px-2 py-1 hover:bg-secondary">Sửa</button><button onClick={(e) => { e.stopPropagation(); demoAction('Xóa'); }} className="rounded border border-border p-1.5 hover:bg-secondary" aria-label="Xóa"><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-md border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Chi tiết / Biên tập</div><div className="mt-1 text-[14px] font-semibold">{selected?.title ?? 'Chọn một bản ghi'}</div></div><span className="text-[11px] text-muted-foreground">{selected?.id}</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[11.5px] font-semibold">Tiêu đề<input defaultValue={selected?.title ?? ''} className="mt-1.5 h-9 w-full rounded border border-border bg-background px-3 font-normal" /></label><label className="text-[11.5px] font-semibold">Trạng thái<select defaultValue={selected?.status ?? ''} className="mt-1.5 h-9 w-full rounded border border-border bg-background px-3 font-normal"><option>{selected?.status ?? 'Nháp'}</option><option>Nháp</option><option>Chờ duyệt</option><option>Đã duyệt</option><option>Xuất bản</option><option>Đang hoạt động</option></select></label></div>
          <label className="mt-3 block text-[11.5px] font-semibold">Ghi chú nghiệp vụ<textarea rows={5} defaultValue={`Nội dung minh họa cho phân hệ ${item.label}. Super Admin có thể tạo, sửa, xóa, cấu hình và thực hiện các thao tác quản trị liên quan.`} className="mt-1.5 w-full rounded border border-border bg-background p-3 font-normal" /></label>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => demoAction('Lưu thay đổi')} className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-2 text-[12px] font-semibold"><Save className="h-3.5 w-3.5" />Lưu thay đổi</button><button onClick={() => demoAction(item.actions[0] ?? 'Thực hiện')} className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground"><Send className="h-3.5 w-3.5" />{item.actions[0] ?? 'Thực hiện'}</button></div>
        </section>

        <aside className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3 text-[13px] font-semibold">Quyền & chức năng khả dụng</div>
          <div className="divide-y divide-border">{item.features.map((f) => <div key={f} className="flex items-center gap-2 px-4 py-3 text-[12px]"><CheckCircle2 className="h-4 w-4 text-primary" /><span>{f}</span></div>)}</div>
          <div className="border-t border-border p-3"><div className="grid gap-2">{item.actions.map((a) => <button key={a} onClick={() => demoAction(a)} className="rounded border border-border bg-background px-3 py-2 text-left text-[12px] font-medium hover:bg-secondary">{a}</button>)}</div></div>
        </aside>
      </div>

      {notice && <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-[12px] text-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{notice}</span><button onClick={() => setNotice('')} className="ml-auto text-muted-foreground"><X className="h-4 w-4" /></button></div>}
    </div>
  );
}

export default function PagesDemoApp() {
  const [location, navigate] = useLocation();
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentKey = location.split('/')[2] || 'dashboard';
  const current = useMemo(() => ALL_ITEMS.find((i) => i.key === currentKey) ?? ALL_ITEMS[0], [currentKey]);

  const login = () => { sessionStorage.setItem(SESSION_KEY, '1'); setLoggedIn(true); navigate('/quan-tri/dashboard'); };
  const logout = () => { sessionStorage.removeItem(SESSION_KEY); setLoggedIn(false); setMobileOpen(false); navigate('/quan-tri'); };
  if (!loggedIn) return <Login onLogin={login} />;

  const nav = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4"><img src={`${BASE}logo-nidit.svg`} alt="" className="h-8 w-8 rounded bg-[hsl(40_30%_97%)] p-0.5" /><div className="min-w-0 leading-tight"><div className="text-[15px] font-bold tracking-wide text-sidebar-accent-foreground">NIDIT</div><div className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">Super Admin</div></div><button className="ml-auto text-sidebar-foreground md:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X className="h-4 w-4" /></button></div>
      <nav className="adm-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-2.5 py-3 overscroll-contain touch-pan-y">{GROUPS.map((g) => <div key={g.title}><div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">{g.title}</div>{g.items.map((item) => { const active = current.key === item.key; return <Link key={item.key} href={`/quan-tri/${item.key}`} onClick={() => setMobileOpen(false)} className={cn('relative flex min-h-8 items-center gap-2.5 rounded px-2 py-1.5 text-[13px] transition-colors', active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground')}>{active && <span className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r bg-sidebar-primary" />}<item.icon className="h-[15px] w-[15px] shrink-0 opacity-80" /><span className="min-w-0 truncate">{item.label}</span></Link>; })}</div>)}</nav>
      <div className="shrink-0 border-t border-sidebar-border p-3"><a href={BASE} className="mb-2 flex items-center gap-2 px-1 text-[12px] text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"><ExternalLink className="h-3.5 w-3.5" />Trang công khai</a><div className="flex items-center gap-2 rounded bg-sidebar-accent/70 p-2"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground">SA</div><div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[12.5px] font-medium text-sidebar-accent-foreground">Super Admin demo</div><div className="text-[11px] text-sidebar-foreground/60">Toàn quyền hệ thống</div></div><button onClick={logout} className="p-1 text-sidebar-foreground/70 hover:text-sidebar-primary" title="Đăng xuất"><LogOut className="h-4 w-4" /></button></div></div>
    </div>
  );

  return (
    <div className="adm-root adm-paper min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] bg-sidebar md:block">{nav}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 flex md:hidden"><div className="h-[100dvh] w-[min(88vw,315px)] overflow-hidden bg-sidebar">{nav}</div><button className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Đóng" /></div>}
      <div className="relative z-10 min-w-0 md:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6"><button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><PanelLeft className="h-5 w-5" /></button><div className="min-w-0 truncate text-[12px] text-muted-foreground">NIDIT <span className="mx-1.5 opacity-40">/</span><span className="font-medium text-foreground">Super Admin Control Center</span></div><div className="ml-auto hidden items-center gap-2 sm:flex"><span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-0.5 text-[10.5px] font-bold text-primary"><ShieldCheck className="h-3.5 w-3.5" />SUPER ADMIN</span><span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[10.5px] font-semibold"><StatusDot />Đã đăng nhập</span></div></header>
        <main className="min-w-0 max-w-[1600px] px-4 py-6 md:px-6">{current.key === 'dashboard' ? <Dashboard /> : <FeatureWorkspace item={current} />}</main>
      </div>
    </div>
  );
}
