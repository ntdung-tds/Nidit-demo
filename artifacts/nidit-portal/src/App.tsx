import { lazy, Suspense, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError, setAuthTokenGetter } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getAdminToken } from '@/lib/admin-token';
import PublicApp from '@/public/PublicApp';
import { useLocation, Router as WouterRouter } from 'wouter';

// Admin API calls authenticate with a bearer token kept in localStorage.
// (Cookies are unreliable inside the third-party preview iframe.)
setAuthTokenGetter(() => getAdminToken());

const AdminApp = lazy(() => import('@/admin/AdminApp'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Không thử lại với lỗi 4xx (không tìm thấy, không có quyền) để trang báo lỗi hiện ngay
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 1,
    },
  },
});

function isAdminPath(location: string): boolean {
  return location === '/quan-tri' || location.startsWith('/quan-tri/');
}

function RootRouter() {
  const [location] = useLocation();
  return (
    <RoutedErrorBoundary>
      {isAdminPath(location) ? (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <AdminApp />
        </Suspense>
      ) : (
        <PublicApp />
      )}
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RootRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
