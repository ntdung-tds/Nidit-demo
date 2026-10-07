import { resolveApi, snapshotCapturedAt } from './pages-demo-api';
import { rewriteResponseAssets } from './pages-assets';

export { snapshotCapturedAt };

type Options = {
  fetchImpl: typeof fetch;
  pageUrl: string;
  assetBase: string;
  apiBaseUrl?: string;
  timeoutMs?: number;
  onFallbackChange?: (count: number) => void;
};

function jsonResponse(body: unknown, method: string, status = 200): Response {
  return new Response(method === 'HEAD' ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/** Live public reads first; use the bundled snapshot only when the API is unavailable. */
export function createPagesApiFetch({ fetchImpl, pageUrl, assetBase, apiBaseUrl, timeoutMs = 5000, onFallbackChange }: Options): typeof fetch {
  const page = new URL(pageUrl);
  const remoteBase = apiBaseUrl?.replace(/\/+$/, '');
  const remote = remoteBase ? new URL(remoteBase) : null;
  const fallbackRequests = new Set<string>();

  return async (input, init) => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(rawUrl, page);
    const localPrefix = new URL(`${assetBase}api/`, page).pathname;
    const remotePrefix = remote ? `${remote.pathname.replace(/\/+$/, '')}/api/` : null;
    let prefix: string | undefined;
    if (url.origin === page.origin) {
      prefix = [localPrefix, '/api/'].find((candidate) => url.pathname.startsWith(candidate));
    }
    if (remote && url.origin === remote.origin && remotePrefix && url.pathname.startsWith(remotePrefix)) prefix = remotePrefix;
    if (!prefix) return fetchImpl(input, init);

    const request = new Request(input instanceof Request ? input : url, init);
    const method = request.method.toUpperCase();
    const path = url.pathname.slice(prefix.length).replace(/\/+$/, '');
    const target = remoteBase ? `${remoteBase}/api/${path}${url.search}` : null;

    // A snapshot must never pretend that a write or authenticated action succeeded.
    if (method !== 'GET' && method !== 'HEAD' || request.headers.has('authorization')) {
      if (target) return fetchImpl(new Request(target, request));
      return jsonResponse({ error: 'This GitHub Pages demo is read-only; no data was submitted or changed.' }, method, 405);
    }
    request.signal.throwIfAborted();

    const key = `${path}${url.search}`;
    let response: Response | undefined;
    let failure: unknown;
    if (target) {
      const controller = new AbortController();
      const cancel = () => controller.abort(request.signal.reason);
      request.signal.addEventListener('abort', cancel, { once: true });
      const timer = setTimeout(() => controller.abort(new DOMException('API request timed out', 'TimeoutError')), timeoutMs);
      try {
        response = await fetchImpl(new Request(target, request), { signal: controller.signal });
        const isJson = /\bapplication\/(?:[\w.-]+\+)?json\b/i.test(response.headers.get('content-type') ?? '');
        if (!response.ok) {
          // Preserve real API validation/auth/not-found errors. Replit's stopped-app
          // HTML 404, rate limits and server errors indicate service unavailability.
          if (response.status < 500 && response.status !== 408 && response.status !== 429 && !(response.status === 404 && !isJson)) return response;
          throw new Error(`API unavailable: ${response.status}`);
        }
        if (!isJson) throw new Error('API returned HTML or a non-JSON response');
        const payload = method === 'HEAD' ? null : await response.json();
        if (method !== 'HEAD' && (!payload || typeof payload !== 'object')) throw new Error('API returned an invalid JSON payload');
        fallbackRequests.delete(key);
        onFallbackChange?.(fallbackRequests.size);
        return jsonResponse(rewriteResponseAssets(payload, assetBase), method, response.status);
      } catch (error) {
        request.signal.throwIfAborted();
        failure = error;
      } finally {
        clearTimeout(timer);
        request.signal.removeEventListener('abort', cancel);
      }
    }

    const snapshot = resolveApi(path, url.searchParams);
    if (snapshot === undefined) {
      if (response) return response;
      if (failure) throw failure;
      return jsonResponse({ error: `No static snapshot is available for /api/${path}.` }, method, 404);
    }
    if (target) {
      fallbackRequests.add(key);
      onFallbackChange?.(fallbackRequests.size);
    }
    return jsonResponse(rewriteResponseAssets(snapshot, assetBase), method);
  };
}
