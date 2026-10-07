/** Public assets are deployed below the GitHub Pages repository path. */
export function rewriteResponseAssets(value: unknown, base: string): unknown {
  if (typeof value === 'string') {
    if (/^\/(?:images|files|videos)\//.test(value) || value === '/logo-nidit.svg' || value === '/favicon.svg') {
      return `${base}${value.slice(1)}`;
    }
    return value.replace(/(["'=])\/(images|files|videos)\//g, `$1${base}$2/`);
  }
  if (Array.isArray(value)) return value.map((item) => rewriteResponseAssets(item, base));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteResponseAssets(item, base)]));
  }
  return value;
}
