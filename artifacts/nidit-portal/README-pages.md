# GitHub Pages demo

The Pages frontend reads current public content from `VITE_API_BASE_URL`. If that API is unreachable, returns a stopped-app HTML page, fails with a server error, or takes more than five seconds, supported public reads use `src/pages-snapshot.json`. Both live responses and the fallback rewrite local image, file and video paths below `/Nidit-demo/`.

A visible notice identifies fallback content and its capture time. Active queries retry the API every minute and on window focus; successful responses replace the fallback. The Reconnect button reloads the page for an immediate retry. A fallback is a saved copy, not current database content.

## API hosting

Set the GitHub Actions repository variable `NIDIT_API_BASE_URL` to the publicly reachable API origin (without `/api`). The workflow passes it to `VITE_API_BASE_URL`. The existing Replit development URL remains the default. A `.replit.dev` URL only works while that Replit app is running; a stopped app currently returns an HTML 404 without CORS headers. Use a running app or a published, persistent backend for continuous live updates.

The API must serve JSON at `/api/home`, `/api/site-settings` and the other public endpoints, and permit the frontend origin `https://ntdung-tds.github.io` through CORS. GitHub Pages hosts the frontend; it does not run the Express server or database.

Without `VITE_API_BASE_URL`, the build uses the snapshot directly. Pages still excludes CMS, visit tracking, data-access submissions and inquiry forms. Failed writes and authenticated requests are never replaced with fake snapshot successes. Real JSON 4xx API responses remain errors. Document files and RSS remain the static published copies.

## Refresh the fallback

With the project API running at `http://localhost:80/api`:

```sh
pnpm --filter @workspace/nidit-portal run export:pages-snapshot
```

This refreshes `src/pages-snapshot.json` and static RSS files under `public/`. Commit the generated files and push to `main`. The exporter accepts `NIDIT_API_BASE`, `PAGES_ORIGIN` and `PAGES_REPO_PATH` if the defaults do not match the environment.

## Verify

Use pnpm 10 as configured in the Pages workflow:

```sh
pnpm run test:pages
PORT=4173 BASE_PATH=/Nidit-demo/ VITE_GITHUB_PAGES=true VITE_API_BASE_URL=https://66t9uc18mn3.sisko.replit.dev pnpm --filter @workspace/nidit-portal run build
```

The regression tests cover live responses, network/CORS failures, stopped-app HTML 404s, server errors, timeouts, cancellation, recovery, asset paths, static-only builds and preservation of write/authentication errors. The Pages workflow runs these tests before building and deploying.
