import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError, setAuthTokenGetter } from '@workspace/api-client-react';
import { Router as WouterRouter, useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getAdminToken } from '@/lib/admin-token';
import PublicApp from '@/public/PublicApp';
import { createPagesApiFetch, snapshotCapturedAt } from './pages-api';
import { setPagesDataSource } from './pages-data-source';

import './index.css';

const AdminApp = lazy(() => import('@/admin/AdminApp'));
const remoteApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

setAuthTokenGetter(() => getAdminToken());
setPagesDataSource(remoteApiBaseUrl ? 'live' : 'snapshot', snapshotCapturedAt);
window.fetch = createPagesApiFetch({
  fetchImpl: window.fetch.bind(window),
  pageUrl: window.location.href,
  assetBase: import.meta.env.BASE_URL,
  apiBaseUrl: remoteApiBaseUrl,
  onFallbackChange: (count) => setPagesDataSource(count ? 'fallback' : 'live', snapshotCapturedAt),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchInterval: remoteApiBaseUrl ? 60_000 : false,
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 1,
    },
  },
});

function isAdminPath(location: string): boolean {
  return location === '/quan-tri' || location.startsWith('/quan-tri/');
}

function PagesRoot() {
  const [location] = useLocation();
  if (isAdminPath(location)) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AdminApp />
      </Suspense>
    );
  }
  return <PublicApp />;
}

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter hook={useHashLocation}>
          <PagesRoot />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
