import test from 'node:test';
import assert from 'node:assert/strict';
import { createPagesApiFetch } from './pages-api';
import { rewriteResponseAssets } from './pages-assets';

const pageUrl = 'https://ntdung-tds.github.io/Nidit-demo/';
const assetBase = '/Nidit-demo/';
const apiBaseUrl = 'https://api.example.test';
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
const offline: typeof fetch = async () => { throw new TypeError('Failed to fetch'); };

test('uses current API data, preserves query parameters and rewrites assets', async () => {
  const fetchImpl: typeof fetch = async (input) => {
    assert.equal((input as Request).url, `${apiBaseUrl}/api/home?lang=en`);
    return json({ title: 'Live content', cover: '/images/live.jpg', html: '<img src="/images/inside.jpg">' });
  };
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl });
  assert.deepEqual(await (await fetcher('/api/home?lang=en')).json(), {
    title: 'Live content', cover: '/Nidit-demo/images/live.jpg', html: '<img src="/Nidit-demo/images/inside.jpg">',
  });
});

for (const [name, fetchImpl] of Object.entries< typeof fetch >({
  'network/CORS failure': offline,
  'Replit stopped-app HTML 404': async () => new Response('<html>Run this app</html>', { status: 404, headers: { 'content-type': 'text/html' } }),
  'HTML 200 instead of API data': async () => new Response('<html>Login</html>', { headers: { 'content-type': 'text/html' } }),
  'server error': async () => json({ error: 'Unavailable' }, 503),
  'rate limit': async () => json({ error: 'Too many requests' }, 429),
  'malformed JSON': async () => new Response('{', { headers: { 'content-type': 'application/json' } }),
  'empty payload': async () => json(null),
})) {
  test(`serves the saved homepage on ${name}`, async () => {
    const counts: number[] = [];
    const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl, onFallbackChange: (n) => counts.push(n) });
    const response = await fetcher('/api/home');
    assert.equal(response.status, 200);
    assert.ok(Object.keys(await response.json()).length > 0);
    assert.deepEqual(counts, [1]);
  });
}

test('snapshot covers public menus, settings, lists, search and detail pages with working asset paths', async () => {
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl: offline });
  for (const path of ['site-settings', 'menu-items?location=main', 'home', 'categories', 'pages/gioi-thieu', 'fields', 'projects', 'publications', 'datasets', 'evaluation-services', 'documents', 'albums', 'leaders', 'org-units', 'search?q=AI']) {
    const response = await fetcher(`${pageUrl}api/${path}`);
    assert.equal(response.status, 200, path);
    assert.ok(await response.json(), path);
  }
  const articles = await (await fetcher('/api/articles?lang=vi')).json();
  assert.ok(articles.items[0].coverImage.startsWith('/Nidit-demo/images/'));
  assert.equal((await fetcher(`/api/articles/${articles.items[0].slug}`)).status, 200);
});

test('bounds a hung API request and uses fallback', async () => {
  const hanging: typeof fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
  });
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl: hanging, timeoutMs: 10 });
  assert.equal((await fetcher('/api/home')).status, 200);
});

test('respects caller cancellation instead of returning stale data', async () => {
  const controller = new AbortController();
  const fetchImpl: typeof fetch = async () => { controller.abort(); throw new DOMException('Cancelled', 'AbortError'); };
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl });
  await assert.rejects(fetcher('/api/home', { signal: controller.signal }), { name: 'AbortError' });
});

test('preserves API authentication and JSON not-found errors', async () => {
  for (const status of [400, 401, 403, 404]) {
    const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl: async () => json({ error: 'API error' }, status) });
    assert.equal((await fetcher('/api/home')).status, status);
  }
});

test('never fakes successful writes or authenticated requests', async () => {
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl: offline });
  await assert.rejects(fetcher('/api/inquiries', { method: 'POST', body: '{}' }));
  await assert.rejects(fetcher('/api/home', { headers: { authorization: 'Bearer test' } }));
  const staticFetcher = createPagesApiFetch({ pageUrl, assetBase, fetchImpl: offline });
  assert.equal((await staticFetcher('/api/inquiries', { method: 'POST' })).status, 405);
});

test('returns to live data when the API recovers', async () => {
  let available = false;
  const counts: number[] = [];
  const fetchImpl: typeof fetch = async () => available ? json({ latest: true }) : offline('/api/home');
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl, onFallbackChange: (n) => counts.push(n) });
  await fetcher('/api/home');
  available = true;
  assert.deepEqual(await (await fetcher('/api/home')).json(), { latest: true });
  assert.deepEqual(counts, [1, 0]);
});

test('leaves other origins and non-API requests untouched', async () => {
  const calls: unknown[] = [];
  const fetchImpl: typeof fetch = async (input) => { calls.push(input); return new Response('untouched'); };
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, apiBaseUrl, fetchImpl });
  for (const url of ['https://other.test/api/home', 'https://api.example.test.attacker.test/api/home', '/Nidit-demo/images/a.jpg']) {
    assert.equal(await (await fetcher(url)).text(), 'untouched');
  }
  assert.equal(calls.length, 3);
});

test('supports static-only builds, HEAD and unknown routes', async () => {
  const fetcher = createPagesApiFetch({ pageUrl, assetBase, fetchImpl: offline });
  assert.equal((await fetcher('/api/home')).status, 200);
  assert.equal(await (await fetcher('/api/home', { method: 'HEAD' })).text(), '');
  assert.equal((await fetcher('/api/unknown')).status, 404);
});

test('asset rewriting is recursive, idempotent and preserves external links', () => {
  const input = { image: '/images/test.jpg', file: '/files/test.pdf', video: '/videos/test.mp4', html: "<img src='/images/test.jpg'>", external: 'https://external.test/images/a.jpg' };
  const once = rewriteResponseAssets(input, assetBase);
  assert.deepEqual(rewriteResponseAssets(once, assetBase), once);
  assert.equal((once as typeof input).external, input.external);
  assert.equal((once as typeof input).file, '/Nidit-demo/files/test.pdf');
});
