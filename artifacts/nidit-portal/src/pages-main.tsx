import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError, setBaseUrl } from '@workspace/api-client-react';
import { Router as WouterRouter } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import PublicApp from '@/public/PublicApp';
import { installPagesDemoApi } from './pages-demo-api';

import './index.css';

const remoteApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

function rewritePublicAsset(value: string): string {
  const base = import.meta.env.BASE_URL;
  const directPrefixes = ['/images/', '/files/', '/videos/'];

  if (directPrefixes.some((prefix) => value.startsWith(prefix))) {
    return `${base}${value.replace(/^\//, '')}`;
  }

  if (value === '/logo-nidit.svg' || value === '/favicon.svg') {
    return `${base}${value.replace(/^\//, '')}`;
  }

  // Rich-text HTML returned by the API may also contain root-relative assets.
  return value.replace(/(["'=])\/(images|files|videos)\//g, `$1${base}$2/`);
}

function rewriteResponseAssets(value: unknown): unknown {
  if (typeof value === 'string') return rewritePublicAsset(value);
  if (Array.isArray(value)) return value.map(rewriteResponseAssets);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, rewriteResponseAssets(item)]),
    );
  }
  return value;
}

function installRemoteApiAssetRewrite(apiBaseUrl: string): void {
  const normalizedApiBase = apiBaseUrl.replace(/\/+$/, '');
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const responseUrl = response.url || (typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const contentType = response.headers.get('content-type') ?? '';

    if (!responseUrl.startsWith(normalizedApiBase) || !contentType.includes('application/json')) {
      return response;
    }

    try {
      const payload = await response.clone().json();
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      return new Response(JSON.stringify(rewriteResponseAssets(payload)), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return response;
    }
  };
}

if (remoteApiBaseUrl) {
  setBaseUrl(remoteApiBaseUrl);
  installRemoteApiAssetRewrite(remoteApiBaseUrl);
} else {
  // Safe fallback for local/static builds that do not provide a remote API URL.
  installPagesDemoApi();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 1,
    },
  },
});

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter hook={useHashLocation}>
          <PublicApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
