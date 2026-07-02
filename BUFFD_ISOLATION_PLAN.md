# Isolating Polish into `@buffd/next`

> Plan to extract the in-app behavioral-analytics pipeline (`src/polish/**` +
> dashboard + glue) into a standalone, installable npm package, **`@buffd/next`**,
> published under the `buffd` org. Authored 2026-06-21.

---

## Goal

Turn the code currently living inside the `create` notes app into
`npm install @buffd/next` — usable in any Next.js (App Router) app — while
`create` itself becomes the first consumer, validating the package against real
traffic before Phase 2 (Synthesize) work continues.

## Why it's mostly clean already

The core (`src/polish/**`) uses **only relative imports internally**, plus
`next/server`, Node builtins (`node:sqlite`/`path`/`fs`), and `pg`. The only real
coupling to the host app is **auth** (`@/lib/auth`), and it lives entirely in the
dashboard route. Everything else is packaging.

| Layer | Files | Host coupling |
|---|---|---|
| Core | `src/polish/{shared/types,config,session,client/init,server/{store,ingest,queries}}` | none (relative + `next/server` + node builtins + `pg`) |
| Glue | `src/proxy.ts`, `src/instrumentation-client.ts`, `src/app/api/polish/route.ts` | `@/polish/*` (path-alias only) |
| Dashboard | `src/app/polish/*` | `@/polish/*` **+ `@/lib/auth`** (the one real dependency) |
| Monitor | `src/app/_components/polish-monitor.tsx` | `@/polish/shared/types` only |

---

## Package design

### Subpath entry points (required for correctness)

A consumer's **browser bundle must never pull in `node:sqlite`/`pg`**, and the
server must never ship to the client. So the package exposes separate exports:

| Export | Contents |
|---|---|
| `@buffd/next` | config + types (isomorphic, safe everywhere) |
| `@buffd/next/client` | `initBuffd()`, `<BuffdMonitor>` |
| `@buffd/next/server` | store, ingest, queries, `withBuffdSession` |
| `@buffd/next/route` | `createBuffdRoute()` — the ingest `POST` handler |
| `@buffd/next/proxy` | `proxy`, `config` (correct matcher), `withBuffdSession`, `buffdMatcher` |
| `@buffd/next/dashboard` | `createBuffdPage()` factory + `<BuffdDashboard>` |

### Proxy method retained (consumer-preferred)

Session cookie minting stays in the **proxy** (Next 16's `middleware`
replacement), not the ingest route. The historical footgun — *the matcher must
exclude all of `/api`, or the whole `/api` segment 404s under Next 16 +
Turbopack* — is real, but Next **statically parses `config.matcher`**, so it must
be an inline literal in the consumer's proxy file: it cannot be imported or
re-exported from the package. The package instead exposes `withBuffdSession`
(cookie logic) + `createBuffdProxy(config)`, and the **`init` CLI scaffolds the
correct matcher literal** so the consumer never hand-writes it.

### Auth: optional `authenticate` callback, unguarded by default

`createBuffdPage()` takes an optional `authenticate` callback:

- **no `authenticate`** → dashboard renders **unguarded** (a one-time
  `console.warn` notes it's public, but it still renders — deliberate choice).
- **`authenticate()` returns false** → renders the `unauthorized` node if the
  consumer passed one (e.g. their own passkey login), else a built-in minimal
  "Unauthorized" screen.
- **`authenticate()` returns true** → fetches queries, renders the dashboard.

The package ships **no** auth/login code (keeps `@simplewebauthn` etc. out of its
deps). `create` keeps its passkey `login.tsx` and passes it via `unauthorized`.

### `init` command — `npx @buffd/next init`

A `bin` script (Node builtins only — no runtime deps) that scaffolds the glue
files so consumers don't hand-create them. **Not** a postinstall (intrusive, runs
in CI, breaks on Vercel read-only build FS).

- Detects `src/` vs root layout and App Router location.
- Writes the four glue shims only if absent (`--force` to overwrite,
  `--dry-run` to preview, `--js` for non-TS apps).
- Non-destructive: if `proxy.ts`/`middleware.ts` exists, prints the merge snippet
  (with the safe matcher) instead of clobbering.
- Appends `.buffd/` to `.gitignore`; optionally writes a starter `buffd.config.ts`.
- Prints next steps (env vars, `DATABASE.md`, dashboard URL `/buffd`).

---

## Package layout

```
buffd-next/                         (@buffd/next)
├── package.json                    exports map; peerDeps next/react/react-dom; optionalDeps pg
├── tsconfig.json
├── tsup.config.ts                  ESM + .d.ts; externalize peers + node:*
├── README.md                       consumer setup (the 4 glue files, env, DB)
├── DATABASE.md                     production DB guide
├── .gitignore
├── bin/
│   └── init.mjs                    npx @buffd/next init
└── src/
    ├── index.ts                    config + types barrel
    ├── client.tsx                  initBuffd + BuffdMonitor barrel
    ├── server.ts                   store/ingest/queries/session barrel
    ├── route.ts                    createBuffdRoute() + POST
    ├── proxy.ts                    proxy, config, withBuffdSession, buffdMatcher
    ├── config.ts  session.ts
    ├── node-sqlite.d.ts
    ├── shared/types.ts
    ├── client/
    │   ├── init.ts                 initBuffd (vanilla DOM)
    │   └── monitor.tsx             <BuffdMonitor> (React)
    ├── server/{store,ingest,queries}.ts
    └── dashboard/
        ├── index.tsx               createBuffdPage() + <BuffdDashboard>
        └── {pages,elements,features,journeys}.tsx
```

`src/` mirrors the old `src/polish/` subtree exactly (so the already-relative
imports keep working) plus top-level barrels.

---

## Rebranding map (`Polish` → `Buffd`)

### Exported identifiers
| Old | New |
|---|---|
| `initPolish` | `initBuffd` |
| `withPolishSession` | `withBuffdSession` |
| `createPolishPage` | `createBuffdPage` |
| `createPolishRoute` | `createBuffdRoute` |
| `PolishConfig` / `defaultPolishConfig` / `definePolishConfig` | `BuffdConfig` / `defaultBuffdConfig` / `defineBuffdConfig` |
| `PolishEvent` / `PolishEventRow` / `PolishEventType` / `PolishIngestBody` | `BuffdEvent` / `BuffdEventRow` / `BuffdEventType` / `BuffdIngestBody` |
| `PolishMonitor` | `BuffdMonitor` |
| `<PolishDashboard>` / `<PolishLogin>` / `PolishLayout` | `<BuffdDashboard>` / (dropped) / `BuffdLayout` |

### Runtime identifiers (breaking, but safe now — prod capture never enabled)
| Concern | Old | New |
|---|---|---|
| Session cookie | `polish_session` | `buffd_session` |
| Env: DB URL | `POLISH_DATABASE_URL` | `BUFFD_DATABASE_URL` |
| Env: SQLite path | `POLISH_DB_PATH` | `BUFFD_DB_PATH` |
| Local DB dir | `.polish/analytics.db` | `.buffd/analytics.db` |
| Internal track hook | `window.__polishTrack` / `dataset.polishTracks` | `__buffdTrack` / `buffdTracks` |
| Config file | `polish.config.ts` | `buffd.config.ts` |

### Default consumer routes (init scaffolder)
| Old | New |
|---|---|
| `/api/polish` | `/api/buffd` |
| `/polish` | `/buffd` |

---

## Consumer setup (what ends up in the README)

```bash
npm install @buffd/next
npm install pg          # optional, Postgres in production
npx @buffd/next init    # scaffolds the glue files
```

Glue files the init command writes:

```ts
// src/proxy.ts  (matcher must be an inline literal — Next can't import it)
import type { NextRequest } from "next/server";
import { withBuffdSession } from "@buffd/next/proxy";
export function proxy(request: NextRequest) { return withBuffdSession(request); }
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|assets).*)"],
};

// src/instrumentation-client.ts
import { initBuffd } from "@buffd/next/client";
initBuffd();

// src/app/api/buffd/route.ts
export { POST, runtime, dynamic } from "@buffd/next/route";

// src/app/buffd/page.tsx  (unguarded by default; runtime/dynamic inline)
import { createBuffdPage } from "@buffd/next/dashboard";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default createBuffdPage();
```

To protect the dashboard, pass an `authenticate` callback (and optionally your
own login UI):

```ts
import { createBuffdPage } from "@buffd/next/dashboard";
import { isAuthenticated, hasRegisteredPasskey } from "@/lib/auth";
import { MyLogin } from "./login";

export default createBuffdPage({
  authenticate: isAuthenticated,
  unauthorized: <MyLogin hasPasskey={hasRegisteredPasskey()} />,
});
```

Env vars: `BUFFD_DATABASE_URL` (pooled Postgres, enables prod capture) and
optionally `BUFFD_DB_PATH` (custom SQLite path in dev). Local dev needs nothing —
it auto-uses `node:sqlite` → `.buffd/analytics.db`.

---

## Execution steps

1. **Scaffold** `buffd-next/` (this branch builds it under the repo for review;
   it lifts out cleanly to the standalone `buffd` org repo — it's one directory).
2. **Move + rebrand core** — copy `src/polish/**` into `buffd-next/src/`, apply
   the rebrand map. Imports are already relative → near-zero structural edits.
3. **Barrels** — `index`, `client`, `server`, `route`, `proxy`.
4. **Dashboard** — port `src/app/polish/*` (minus `login.tsx`) into
   `src/dashboard/`, refactor `page.tsx` into `createBuffdPage()` (optional auth)
   + presentational `<BuffdDashboard>`.
5. **`init` CLI** + `bin` entry.
6. **Build config** — `package.json` (exports/peerDeps), `tsconfig`, `tsup`.
7. **Docs** — `README.md`, `DATABASE.md`.
8. **Verify** — `npm install && npm run build`; confirm `/client` bundle has no
   `node:sqlite`/`pg`, `/server` not importable from client.
9. **Publish** — `npm link` (or `file:`) into `create` first; publish to npm only
   after the Postgres backend + dashboard are validated on real traffic.

### `create` migration — DONE (in-repo workspace, not a separate repo)

Per the decision to stay single-repo until a global publish, `buffd-next/` lives
**inside** `create` as an **npm workspace**, and `create` consumes `@buffd/next`
from it. One repo, one install, one PR; edits to the package require a rebuild
(`npm run build -w @buffd/next`, wired into `create`'s `dev`/`build` scripts).

What was done:
- Root `package.json`: `"workspaces": ["buffd-next"]`, dependency `@buffd/next`,
  and `dev`/`build` build the package first.
- `next.config.ts`: `transpilePackages: ["@buffd/next"]` (resolves the ESM/RSC
  dist like first-party code).
- `tailwind.config.ts`: scans `buffd-next/src` so dashboard classes generate.
- `tsconfig.json`: excludes `buffd-next` (the workspace typechecks itself).
- `buffd.config.ts`: pins legacy values for **production continuity** —
  `sessionCookie: "polish_session"`, `apiRoute: "/api/polish"`. The package also
  reads `POLISH_DATABASE_URL`/`POLISH_DB_PATH` as fallbacks, so **no Vercel env
  change is needed** and the dashboard stays at `/polish`. (Note: the store reads
  its SQLite path from env/default, not the config object, so the local-dev DB
  lives at `.buffd/analytics.db` — disposable and gitignored. Set `BUFFD_DB_PATH`
  to relocate it. Making `config.databasePath` authoritative is a package
  follow-up.)
- Glue files (`src/proxy.ts`, `src/instrumentation-client.ts`,
  `src/app/api/polish/route.ts`, `src/app/polish/page.tsx`) now call the package,
  injecting `buffd.config`. `login.tsx` + `layout.tsx` stay app-local; auth is
  injected via `authenticate` (with the original local-dev skip preserved).
- Deleted `src/polish/**`, the four moved dashboard tables,
  `src/app/_components/polish-monitor.tsx` (now `BuffdMonitor` from
  `@buffd/next/client`), `src/types/node-sqlite.d.ts`, and `polish.config.ts`.

Verified: package typecheck + build, `create` typecheck, full `next build`, and a
runtime smoke test (`/polish` renders, store "collecting", proxy sets
`polish_session`, no console errors).

### When ready to publish globally

Extract `buffd-next/` to its own repo, flip `create`'s dependency from
`"@buffd/next": "*"` (workspace) to a version range, `npm publish`. The package's
`exports` already point to `dist`, so nothing structural changes. Carry over the
Turbopack gotcha: after dependency changes, `rm -rf .next` and restart the dev
server (it poisons the cache).
