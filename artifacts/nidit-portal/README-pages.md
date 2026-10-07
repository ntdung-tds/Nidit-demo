# GitHub Pages demo

This Pages build is a static, read-only snapshot. It does not connect to the API server or database. The CMS, visit tracking, data-access requests, and inquiry forms are disabled; published document files and static RSS feeds remain available.

## Refresh the content snapshot

With the project API running and reachable at `http://localhost:80/api`, run:

```sh
pnpm --filter @workspace/nidit-portal run export:pages-snapshot
```

This refreshes `src/pages-snapshot.json` and the static RSS files under `public/`. Commit those generated files and push to `main`; the Pages workflow builds and deploys the static site.

The exporter accepts `NIDIT_API_BASE`, `PAGES_ORIGIN`, and `PAGES_REPO_PATH` when the defaults do not match the environment.
