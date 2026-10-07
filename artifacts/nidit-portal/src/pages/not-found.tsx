import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4">
      <div className="max-w-md border-l-2 border-seal pl-6">
        <div className="num text-6xl text-navy">404</div>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">Đường dẫn không tồn tại hoặc đã được thay đổi.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">Về trang chủ</Link>
      </div>
    </div>
  );
}
