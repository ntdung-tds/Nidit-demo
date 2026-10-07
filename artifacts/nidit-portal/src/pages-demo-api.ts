import snapshotJson from './pages-snapshot.json';

type JsonRecord = Record<string, any>;

const data = snapshotJson as JsonRecord;
const labels: Record<string, string> = {
  article: 'Tin tức',
  document: 'Văn bản',
  project: 'Đề tài, dự án',
  publication: 'Công bố khoa học',
  dataset: 'Dữ liệu AI',
  service: 'Đánh giá, kiểm định',
  page: 'Trang thông tin',
};

function normalized(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi');
}

function matchesQuery(item: unknown, query: string): boolean {
  return !query || normalized(JSON.stringify(item)).includes(normalized(query));
}

function pageResult(items: JsonRecord[], params: URLSearchParams, defaultPageSize: number, extras: JsonRecord = {}) {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize')) || defaultPageSize));
  const total = items.length;
  return {
    ...extras,
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function getArticleItems(lang: string) {
  return data.articles[lang === 'en' ? 'en' : 'vi'].items as JsonRecord[];
}

function searchResults(query: string, type?: string) {
  const term = normalized(query.trim().slice(0, 100));
  const articleItems = [...new Map([...getArticleItems('vi'), ...getArticleItems('en')].map((item) => [item.slug, item])).values()];
  const articleText = (item: JsonRecord) => {
    const detail = data.articles.details[item.slug]?.article;
    return [item.title, item.summary, item.tags, detail?.content].join(' ');
  };
  const candidates: Record<string, JsonRecord[]> = {
    article: articleItems.filter((item) => normalized(articleText(item)).includes(term)).map((item) => ({
      type: 'article', id: item.id, title: item.title, snippet: item.summary || null,
      url: `/tin-tuc/${item.slug}`, date: item.publishedAt ?? null,
    })),
    document: data.documents.items.filter((item: JsonRecord) => normalized([item.number, item.title, item.summary, item.issuer].join(' ')).includes(term)).map((item: JsonRecord) => ({
      type: 'document', id: item.id, title: `${item.docType} số ${item.number}: ${item.title}`,
      snippet: [item.issuer, item.summary].filter(Boolean).join(' · ') || null, url: `/van-ban/${item.id}`, date: item.issuedDate,
    })),
    project: data.projects.items.filter((item: JsonRecord) => normalized([item.title, item.code, item.summary, item.leadName, item.keywords].join(' ')).includes(term)).map((item: JsonRecord) => ({
      type: 'project', id: item.id, title: item.title,
      snippet: `${item.code} · ${item.leadName} · ${item.startYear}–${item.endYear ?? 'nay'}. ${item.summary}`,
      url: `/nghien-cuu/${item.slug}`, date: null,
    })),
    publication: data.publications.items.filter((item: JsonRecord) => normalized([item.title, item.authors, item.venue, item.keywords].join(' ')).includes(term)).map((item: JsonRecord) => ({
      type: 'publication', id: item.id, title: item.title,
      snippet: `${item.authors} · ${item.venue}, ${item.year}`,
      url: `/cong-bo-khoa-hoc?q=${encodeURIComponent(item.title)}`, date: null,
    })),
    dataset: data.datasets.items.filter((item: JsonRecord) => normalized([item.title, item.summary, item.keywords, item.aiTasks].join(' ')).includes(term)).map((item: JsonRecord) => ({
      type: 'dataset', id: item.id, title: item.title, snippet: item.summary || null,
      url: `/du-lieu-ai/${item.slug}`, date: item.issuedDate,
    })),
    service: data.services.items.filter((item: JsonRecord) => normalized([item.name, item.summary].join(' ')).includes(term)).map((item: JsonRecord) => ({
      type: 'service', id: item.id, title: item.name, snippet: item.summary || null,
      url: `/danh-gia-kiem-dinh/${item.slug}`, date: null,
    })),
    page: Object.values(data.staticPages).filter((item: JsonRecord) => normalized([item.title, item.summary, item.content].join(' ')).includes(term)).map((item: JsonRecord) => ({
      type: 'page', id: item.id, title: item.title, snippet: item.summary || null,
      url: item.slug === 'gioi-thieu' ? '/gioi-thieu' : item.slug === 'chuc-nang-nhiem-vu' ? '/gioi-thieu/chuc-nang-nhiem-vu' : `/trang/${item.slug}`,
      date: null,
    })),
  };
  const groups = Object.entries(candidates)
    .filter(([key, items]) => items.length && (!type || key === type))
    .map(([key, items]) => ({
      type: key,
      label: labels[key],
      total: items.length,
      items: items.slice(0, type ? 30 : 5),
    }));
  return { query: query.trim().slice(0, 100), total: groups.reduce((sum, group) => sum + group.total, 0), groups };
}

function resolveApi(path: string, params: URLSearchParams): unknown {
  const parts = path.split('/').filter(Boolean).map((part) => decodeURIComponent(part));
  const [resource, identifier, action] = parts;
  const q = params.get('q') ?? '';

  if (resource === 'site-settings' && !identifier) return data.siteSettings;
  if (resource === 'visit-counter' && !identifier) return data.visitCounter;
  if (resource === 'menu-items' && !identifier) {
    const location = params.get('location');
    return location ? data.menus.filter((item: JsonRecord) => item.location === location) : data.menus;
  }
  if (resource === 'categories' && !identifier) return data.categories;
  if (resource === 'pages' && identifier) return data.staticPages[identifier];
  if (resource === 'home' && !identifier) return data.home[params.get('lang') === 'en' ? 'en' : 'vi'];

  if (resource === 'articles' && identifier === 'popular') {
    const lang = params.get('lang') === 'en' ? 'en' : 'vi';
    const limit = Math.max(1, Math.min(20, Number(params.get('limit')) || 6));
    return data.articles.popular[lang].slice(0, limit);
  }
  if (resource === 'articles' && identifier) return data.articles.details[identifier];
  if (resource === 'articles') {
    const lang = params.get('lang') === 'en' ? 'en' : 'vi';
    let items = getArticleItems(lang);
    const category = params.get('category');
    const tag = params.get('tag');
    if (category) {
      const root = data.categories.find((item: JsonRecord) => item.slug === category);
      const categoryIds = new Set<number>(root ? [root.id] : []);
      let expanded = true;
      while (expanded) {
        expanded = false;
        for (const candidate of data.categories as JsonRecord[]) {
          if (candidate.parentId != null && categoryIds.has(candidate.parentId) && !categoryIds.has(candidate.id)) {
            categoryIds.add(candidate.id);
            expanded = true;
          }
        }
      }
      items = items.filter((item) => categoryIds.has(item.categoryId));
    }
    if (tag) items = items.filter((item) => Array.isArray(item.tags) && item.tags.includes(tag));
    if (q) items = items.filter((item) => matchesQuery(item, q));
    return pageResult(items, params, 12);
  }

  if (resource === 'fields' && !identifier) return data.fields.items;
  if (resource === 'fields' && identifier) return data.fields.details[identifier];

  if (resource === 'projects' && identifier) return data.projects.details[identifier];
  if (resource === 'projects') {
    let items = [...data.projects.items] as JsonRecord[];
    const status = params.get('status');
    const fieldId = params.get('fieldId');
    if (status) items = items.filter((item) => item.status === status);
    if (fieldId) items = items.filter((item) => String(item.fieldId) === fieldId);
    if (q) items = items.filter((item) => matchesQuery(item, q));
    return pageResult(items, params, 12, { statusCounts: data.projects.statusCounts });
  }

  if (resource === 'publications') {
    let items = [...data.publications.items] as JsonRecord[];
    const type = params.get('type');
    const year = params.get('year');
    const fieldId = params.get('fieldId');
    if (type) items = items.filter((item) => item.type === type);
    if (year) items = items.filter((item) => String(item.year) === year);
    if (fieldId) items = items.filter((item) => String(item.fieldId) === fieldId);
    if (q) items = items.filter((item) => matchesQuery(item, q));
    return pageResult(items, params, 12, { years: data.publications.years, typeCounts: data.publications.typeCounts });
  }

  if (resource === 'datasets' && identifier === 'stats') return data.datasets.stats;
  if (resource === 'datasets' && identifier) return data.datasets.details[identifier];
  if (resource === 'datasets') {
    let items = [...data.datasets.items] as JsonRecord[];
    const accessLevel = params.get('accessLevel');
    const fieldId = params.get('fieldId');
    if (accessLevel) items = items.filter((item) => item.accessLevel === accessLevel);
    if (fieldId) items = items.filter((item) => String(item.fieldId) === fieldId);
    if (q) items = items.filter((item) => matchesQuery(item, q));
    return items;
  }

  if (resource === 'evaluation-services' && identifier) return data.services.details[identifier];
  if (resource === 'evaluation-services') return data.services.items;

  if (resource === 'documents' && identifier) {
    if (action === 'download') return undefined;
    return data.documents.details[identifier];
  }
  if (resource === 'documents') {
    let items = [...data.documents.items] as JsonRecord[];
    const docGroup = params.get('docGroup');
    const docType = params.get('docType');
    const issuer = params.get('issuer');
    const year = params.get('year');
    const fieldId = params.get('fieldId');
    if (docGroup) items = items.filter((item) => item.docGroup === docGroup);
    if (docType) items = items.filter((item) => item.docType === docType);
    if (issuer) items = items.filter((item) => item.issuer === issuer);
    if (year) items = items.filter((item) => String(item.issuedDate).slice(0, 4) === year);
    if (fieldId) items = items.filter((item) => String(item.fieldId) === fieldId);
    if (q) items = items.filter((item) => matchesQuery(item, q));
    const sort = params.get('sort') ?? 'newest';
    items.sort((a, b) => sort === 'oldest'
      ? String(a.issuedDate).localeCompare(String(b.issuedDate))
      : sort === 'downloads'
        ? Number(b.downloadCount) - Number(a.downloadCount)
        : String(b.issuedDate).localeCompare(String(a.issuedDate)));
    return pageResult(items, params, 15, { facets: data.documents.facets });
  }

  if (resource === 'albums' && identifier) return data.albums.details[identifier];
  if (resource === 'albums') {
    const type = params.get('type');
    return type ? data.albums.items.filter((item: JsonRecord) => item.type === type) : data.albums.items;
  }
  if (resource === 'leaders' && !identifier) return data.leaders;
  if (resource === 'org-units' && !identifier) return data.orgUnits;
  if (resource === 'search' && !identifier) return searchResults(q, params.get('type') ?? undefined);

  return undefined;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}

export function installPagesDemoApi(): void {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(rawUrl, window.location.href);
    const apiMatch = /\/api\/(.*)$/.exec(url.pathname);
    if (!apiMatch) return originalFetch(input, init);

    if (method !== 'GET' && method !== 'HEAD') {
      return jsonResponse({ error: 'This GitHub Pages demo is read-only; no data was submitted or changed.' }, 405);
    }

    const result = resolveApi(apiMatch[1].replace(/\/+$/, ''), url.searchParams);
    if (result === undefined) {
      return jsonResponse({ error: `No static snapshot is available for /api/${apiMatch[1]}.` }, 404);
    }
    return jsonResponse(result);
  };
}
