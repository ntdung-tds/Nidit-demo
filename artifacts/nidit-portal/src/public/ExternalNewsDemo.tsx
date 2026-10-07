import { ExternalLink, Rss } from 'lucide-react';
import { usePortal } from './lib';

const EXTERNAL_NEWS = [
  {
    source: 'Bộ Khoa học và Công nghệ',
    date: '06/10/2026',
    title: 'Việt Nam - Nga trao đổi kinh nghiệm về chuyển đổi số',
    href: 'https://mst.gov.vn/viet-nam-nga-trao-doi-kinh-nghiem-ve-chuyen-doi-so-197261006173958359.htm',
  },
  {
    source: 'Bộ Khoa học và Công nghệ',
    date: '06/10/2026',
    title: 'Đà Nẵng kết nối đổi mới sáng tạo gắn với chuyển đổi số',
    href: 'https://mst.gov.vn/da-nang-ket-noi-doi-moi-sang-tao-gan-voi-chuyen-doi-so-197261005224515493.htm',
  },
  {
    source: 'Báo Điện tử Chính phủ',
    date: '30/09/2026',
    title: 'Công nghiệp công nghệ số đạt hơn 5,38 triệu tỷ đồng',
    href: 'https://baochinhphu.vn/cong-nghiep-cong-nghe-so-dat-hon-538-trieu-ty-dong-10226093016510911.htm',
  },
  {
    source: 'Báo Nhân Dân',
    date: '30/09/2026',
    title: 'Tháng 9, doanh thu công nghiệp công nghệ số tăng 36% so với cùng kỳ',
    href: 'https://nhandan.vn/thang-9-doanh-thu-cong-nghiep-cong-nghe-so-tang-36-so-voi-cung-ky-post991938.html',
  },
  {
    source: 'VnExpress',
    date: '15/09/2026',
    title: 'Nhiều hoạt động hưởng ứng Ngày Chuyển đổi số Quốc gia',
    href: 'https://vnexpress.net/nhieu-hoat-dong-huong-ung-ngay-chuyen-doi-so-quoc-gia-5119289.html',
  },
] as const;

export function ExternalNewsDemo() {
  const { t } = usePortal();
  return (
    <section className="container-portal mt-12" aria-label={t('Tin tổng hợp từ nguồn ngoài', 'External news feeds')} data-testid="external-news-demo">
      <div className="mb-4 flex flex-col gap-2 border-b border-rule pb-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-seal">
            <Rss className="h-4 w-4" />
            {t('Nguồn tin cập nhật tự động', 'Automatic news feeds')}
            <span className="border border-seal/30 bg-seal/5 px-1.5 py-0.5 text-[0.6rem] tracking-[0.08em]">DEMO</span>
          </div>
          <h2 className="mt-1 font-display text-[1.35rem] font-semibold text-ink">
            {t('Kết quả thu thập từ các nguồn bên ngoài', 'Collected items from external sources')}
          </h2>
        </div>
        <p className="max-w-xl text-[0.75rem] leading-relaxed text-muted-foreground sm:text-right">
          {t('Hiển thị 5 kết quả mẫu đã lấy từ các nguồn tin. Khi vận hành, tin mới được thu thập định kỳ và đưa vào hàng chờ biên tập trước khi xuất bản.', 'Five sample results collected from external sources. In production, new items are fetched periodically and queued for editorial review before publication.')}
        </p>
      </div>

      <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
        {EXTERNAL_NEWS.map((item) => (
          <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="group flex min-h-40 flex-col bg-card p-4 transition-colors hover:bg-paper" data-testid="external-news-item">
            <div className="flex items-start justify-between gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.05em] text-seal">
              <span>{item.source}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
            </div>
            <h3 className="mt-3 font-display text-[0.95rem] font-semibold leading-snug text-ink group-hover:text-navy group-hover:underline group-hover:decoration-seal group-hover:underline-offset-4">{item.title}</h3>
            <div className="num mt-auto pt-4 text-[0.68rem] text-muted-foreground">{item.date}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
