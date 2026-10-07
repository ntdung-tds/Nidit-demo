import { Link } from 'wouter';
import { ArrowLeft, Search } from 'lucide-react';
import { usePortal, useSeo } from '../lib';

export default function NotFoundPage() {
  const { t } = usePortal();
  useSeo(t('Không tìm thấy trang', 'Page not found'), null);
  return (
    <div className="paper-grain bg-paper">
      <div className="container-portal grid gap-10 py-20 md:grid-cols-[auto_1fr] md:items-center">
        <div className="num text-[7rem] font-medium leading-none text-navy md:text-[9rem]">404</div>
        <div className="max-w-xl md:border-l-2 md:border-seal md:pl-10">
          <div className="kicker">{t('Lỗi truy cập', 'Error')}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{t('Không tìm thấy nội dung yêu cầu', 'The requested page could not be found')}</h1>
          <p className="mt-3 text-muted-foreground">{t('Đường dẫn có thể đã thay đổi hoặc nội dung đã được gỡ bỏ. Vui lòng quay về trang chủ hoặc dùng chức năng tìm kiếm.', 'The link may have changed or the content was removed. Return home or use search.')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 bg-navy px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep" data-testid="link-404-home"><ArrowLeft className="h-4 w-4" />{t('Về trang chủ', 'Home')}</Link>
            <Link href="/tim-kiem" className="inline-flex items-center gap-2 border border-rule bg-card px-4 py-2 text-sm font-semibold hover:border-navy" data-testid="link-404-search"><Search className="h-4 w-4" />{t('Tìm kiếm', 'Search')}</Link>
            <Link href="/so-do-trang" className="inline-flex items-center px-2 py-2 text-sm text-navy underline-offset-4 hover:underline">{t('Sơ đồ trang', 'Sitemap')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
