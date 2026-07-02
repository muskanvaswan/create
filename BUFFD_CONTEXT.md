# Buffd — Session Context

> Drop this file into a new conversation to pick up where we left off.
> Tagline: **"What gets measured gets improved."**
> Last updated: 2026-06-22 (after isolation into `@buffd/next` + rebrand).

---

## What Buffd is

A self-contained **product-analytics + iterative-improvement** pipeline for
Next.js apps. It captures real user behavioral signals and (eventually) turns
them into deployed code fixes. The 6-stage vision:

```
[1] Capture  →  [2] Synthesize  →  [3] Hypothesize
User events      Ranked issue list   AI-generated fixes

[4] Experiment  →  [5] Judge  →  [6] Audit
Flag-guarded code   Auto deploy/discard  Aesthetic gap scan
```

**Only Stage 1 (the Collector) is built.** Everything below is Stage 1.

Originally developed in-app as "Polish" under `src/polish/`; now **extracted into
the `@buffd/next` package**. Renamed Polish → Buffd, and the word "friction" was
removed everywhere in favour of "issues / score / behavioral signals".

---

## Repo / branch / PR

- Repo: `muskanvaswan/create` (the personal notes site at notes.muskanvaswan.xyz;
  git remote is `blog.git`). Deployed on **Vercel** (read-only FS — never write
  events to disk; DB only).
- Working branch: **`claude/isolate-buffd-package`**
- PR: **https://github.com/muskanvaswan/create/pull/24** (open, not merged)
- Worktree used this session: `.claude/worktrees/sharp-snyder-0c70e9`

---

## Current architecture: in-repo workspace (NOT yet published)

`@buffd/next` lives at **`buffd-next/`** inside the `create` repo as an **npm
workspace**. `create` consumes it like a real dependency, but it's one repo, one
`npm install`, one PR. This was a deliberate choice to avoid the dual-repo
publish/version dance until a global npm publish is worthwhile.

- Root `package.json`: `"workspaces": ["buffd-next"]`, dep `"@buffd/next": "*"`;
  `dev`/`build` scripts run `npm run build --workspace @buffd/next` first.
- `next.config.ts`: `transpilePackages: ["@buffd/next"]` (resolves the package's
  ESM/RSC `dist` like first-party code).
- `tailwind.config.ts`: content globs include `./buffd-next/src/**/*.{ts,tsx}` so
  the dashboard's Tailwind classes get generated.
- `tsconfig.json`: `exclude` lists `buffd-next` (the workspace typechecks itself).
- The package builds with **`tsc`** → `dist/` (ESM + `.d.ts`), preserving
  `"use client"` boundaries. `exports` already point to `dist` (publish-ready).

**To publish globally later:** extract `buffd-next/` to its own repo, flip
`create`'s dep from `"*"` to a version range, `npm publish`. Nothing structural
changes.

---

## Package structure (`buffd-next/`)

```
buffd-next/
├── package.json            exports map; peerDeps next/react/react-dom; optionalDep pg
├── tsconfig.json / tsconfig.build.json
├── README.md  DATABASE.md  .gitignore
├── bin/init.mjs            `npx @buffd/next init` scaffolder (Node builtins only)
└── src/
    ├── index.ts            barrel: config + types          → "@buffd/next"
    ├── client.ts           barrel: initBuffd, BuffdMonitor  → "@buffd/next/client"
    ├── server.ts           barrel: store/ingest/queries/session → "@buffd/next/server"
    ├── route.ts            createBuffdRoute() + POST        → "@buffd/next/route"
    ├── proxy.ts            proxy, config, withBuffdSession, createBuffdProxy, buffdMatcher → "@buffd/next/proxy"
    ├── config.ts           BuffdConfig, defaultBuffdConfig, defineBuffdConfig
    ├── session.ts          withBuffdSession(req, res?, config?) — Edge-safe cookie setter
    ├── shared/types.ts     BuffdEvent(Row/Type), BuffdIngestBody, CLIENT_EVENT_TYPES
    ├── node-sqlite.d.ts    ambient types for node:sqlite
    ├── client/
    │   ├── init.ts         initBuffd() — all browser capture (vanilla DOM)
    │   └── monitor.tsx     <BuffdMonitor> — component-level tracking (React)
    ├── server/
    │   ├── store.ts        SQLite (dev) + Postgres (prod) backends; degrades to no-op
    │   ├── ingest.ts       ingest(body, cookieValue) → IngestResult
    │   └── queries.ts      getOverview, getTopPages, getPageStats, getElementStats,
    │                       getTopInteractions, getDeviceBreakdown, getSessionJourneys,
    │                       getMonitoredComponents, getRecentErrors
    └── dashboard/
        ├── index.tsx       createBuffdPage({authenticate?, unauthorized?}),
        │                   <BuffdDashboard data>, loadBuffdDashboardData()
        └── {pages,elements,features,journeys}.tsx  (client subcomponents)
```

### Subpath exports = correctness boundary
The split keeps DB drivers (`node:sqlite`/`pg`) out of the browser bundle and
keeps server code from leaking client-side. Verified: the `/client` bundle has no
DB code.

---

## How `create` consumes it (the glue)

These thin files in `create` call the package, injecting `buffd.config.ts`:

- `src/proxy.ts` → `createBuffdProxy(buffdConfig)` for the cookie; **inline matcher
  literal** (see gotchas).
- `src/instrumentation-client.ts` → `initBuffd(buffdConfig)`.
- `src/app/api/polish/route.ts` → `createBuffdRoute(buffdConfig)`.
- `src/app/polish/page.tsx` → `createBuffdPage({ authenticate, unauthorized })`;
  declares `runtime`/`dynamic` inline; auth skips in dev, requires passkey in prod.
- `src/app/polish/login.tsx` + `layout.tsx` → **stay app-local** (passkey UI).
- `buffd.config.ts` (root) → pins legacy values for continuity (see below).
- `<BuffdMonitor>` is imported from `@buffd/next/client` in
  `src/app/_components/notes-app.tsx`.

Deleted during migration: `src/polish/**`, the moved dashboard tables,
`polish-monitor.tsx`, `src/types/node-sqlite.d.ts`, `polish.config.ts`.

---

## Production continuity (IMPORTANT — kept identical to pre-rename)

The live app's behaviour is unchanged; **no Vercel env changes needed**:
- Session cookie stays **`polish_session`** (pinned in `buffd.config.ts`).
- Routes stay **`/polish`** and **`/api/polish`** (dashboard + ingest).
- `store.ts` reads `BUFFD_DATABASE_URL ?? POLISH_DATABASE_URL` and
  `BUFFD_DB_PATH ?? POLISH_DB_PATH` (fallbacks).

The package's *own defaults* (for fresh consumers) are `buffd_session`, `/buffd`,
`/api/buffd`, `.buffd/analytics.db`.

---

## Events captured (no PII)

`page_view`, `click`, `rage_click` (3+ rapid clicks/elem), `dead_click` (click on
non-interactive elem — **text selections are excluded**, see below), `scroll_depth`,
`viewport` (device bucket), `js_error`, `web_vital` (LCP/CLS), `hover`,
`component_view`, `mount`, `session_end`.

Client batches and flushes every 10s + on `pagehide` (sendBeacon). Cookie minted
in the proxy (httpOnly UUID, GDPR-safe). Server attributes events to the cookie's
session only — clients never send a session id.

## Dashboard at `/polish`

Pure-black Vercel-style UI, passkey-gated in prod (open in dev). Hero reads the
tagline. Sections: Overview stats (with `ⓘ` tooltips), Device sizes, Top pages
(click → sessions-over-time chart), Monitored components (`<BuffdMonitor>` data),
Sampled user journeys (ranked by composite score = rage×3 + dead×2 + errors×2.5),
Most-used features, Interactions by element, Recent errors.

## Storage

- **Dev:** `node:sqlite` (built into Node 22+) → `.buffd/analytics.db` (gitignored).
- **Prod:** **Postgres via `pg` is now IMPLEMENTED** in `store.ts` (`openPostgres`:
  pooled `Pool`, `CREATE TABLE IF NOT EXISTS`, batched multi-row INSERT with
  `$1,$2…` placeholders, bigint/numeric type parsers). Selected when
  `BUFFD_DATABASE_URL`/`POLISH_DATABASE_URL` is set. Neon was the chosen host.
- **Fallback:** unreachable/read-only → safe no-op + `console.warn`; dashboard
  shows a notice; app never breaks.

## Auth

`createBuffdPage({ authenticate, unauthorized })`. The package ships **no** auth
code. `create` injects `isAuthenticated()` from `@/lib/auth` (same `notes_session`
cookie as `/admin`) and passes its own passkey `<PolishLogin>` as `unauthorized`.
No `authenticate` → dashboard is unguarded (dev-only console warning).

---

## Gotchas (do not re-discover these)

1. **`config.matcher` must be an inline literal** in the proxy file — Next
   statically parses it; it can't be imported/re-exported from the package. The
   `init` CLI scaffolds the correct literal. Must exclude all of `/api` or the
   whole `/api` segment 404s under Next 16 + Turbopack.
2. **Route segment config (`runtime`/`dynamic`) must be declared inline** in the
   page module — can't be re-exported from the package.
3. **Workspace `next` version must dedupe with the host** (`buffd-next` devDep
   `next ^16`). A mismatched copy in `buffd-next/node_modules` gives two
   `NextRequest` types → build type error.
4. **`config.databasePath` is NOT authoritative** — `store.ts` reads the SQLite
   path from `BUFFD_DB_PATH`/`POLISH_DB_PATH`/default only. Local dev DB lives at
   `.buffd/analytics.db` regardless of config. (Noted follow-up: plumb config →
   store.)
5. **`require("pg")` inside an ESM package** works via Next's bundler but would
   fail under raw Node ESM. Switch to `await import("pg")` if ever consumed
   outside Next. (Noted follow-up.)
6. **`npm install`/workspace change while `next dev --turbopack` runs poisons the
   cache** → `rm -rf .next` and restart.
7. The package builds to `dist`; **`next dev`/`build` must build it first**
   (wired into `create`'s scripts). Editing package source needs a rebuild
   (`npm run build -w @buffd/next`, or `tsc -w` for live editing).
8. **Dead clicks vs text selection:** a drag-to-highlight fires a `click` on the
   text node; `init.ts` now skips `dead_click` when a non-empty selection exists
   (`hasTextSelection()`). Historical data still includes old selection-clicks.

---

## Key env vars

| Var | Where | Purpose |
|---|---|---|
| `BUFFD_DATABASE_URL` (or legacy `POLISH_DATABASE_URL`) | Vercel | Pooled Postgres string → enables prod capture |
| `BUFFD_DB_PATH` (or legacy `POLISH_DB_PATH`) | `.env.local` | Custom SQLite path (dev, optional) |
| `AUTH_SECRET` | Vercel | Signs `notes_session` cookie (admin + dashboard) |
| `SETUP_PASSWORD` / `PASSKEY_CREDENTIAL` | Vercel | Passkey registration / stored passkey |

---

## What to work on next (priority order)

1. **Provision Neon + set `BUFFD_DATABASE_URL`** on Vercel to start real
   production capture (the Postgres backend is ready). Validate Stage 1 data on
   real traffic before any AI work.
2. **Small package follow-ups:** make `config.databasePath` authoritative; switch
   `require("pg")` → `await import("pg")`.
3. **Optional full rebrand of runtime identifiers** — flip `/polish` → `/buffd`,
   `polish_session` → `buffd_session` (breaking: resets sessions, needs env
   update). Deliberately deferred for continuity.
4. **Publish `@buffd/next` to npm** once validated (extract repo, flip dep).
5. **Phase 2 — Synthesize** (`src/.../synthesize.ts` in the package): Claude reads
   the signals → ranked list of UX issues. Only after real data is flowing.

## Related files

- `BUFFD_ISOLATION_PLAN.md` — the full isolation plan + decisions (this session).
- `buffd-next/README.md` — consumer setup docs.
- `buffd-next/DATABASE.md` — production DB setup (schema, Neon, retention).
- Original spec: `~/Library/Mobile Documents/com~apple~CloudDocs/build-plan-iterative-polish.md`
