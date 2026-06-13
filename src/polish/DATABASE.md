# Polish — Database setup

Polish captures a high-frequency stream of behavioral events. In **local
development** it writes them to a SQLite file with zero configuration. In
**production** you must point it at a writable, network-accessible database,
because most modern hosts (Vercel, Netlify, Cloudflare) run your app on a
**read-only, ephemeral filesystem** — a local SQLite file there either fails to
open or is wiped on every cold start.

Crucially, Polish events must **not** go through the same GitHub-commit storage
the notes content uses: a commit (and redeploy) per event would be catastrophic.
Analytics needs a real database.

---

## How the store decides what to use

`src/polish/server/store.ts` opens its backend lazily and picks it in this
order:

1. **`POLISH_DATABASE_URL`** is set → use that Postgres database (production).
2. Otherwise → use SQLite at **`POLISH_DB_PATH`** (defaults to
   `.polish/analytics.db`), good for local dev.
3. If neither can be opened (read-only FS, bad URL) → the store **latches to a
   safe no-op**: capture silently drops, the `/polish` dashboard shows a notice,
   and the host app is never taken down.

> The Postgres adapter is the production TODO referenced below. The interface
> (`storeReady`, `insertEvents`, the query helpers) is already backend-agnostic,
> so adding it is an isolated change — no caller has to know which backend is
> live.

---

## Local development (default — nothing to do)

```bash
npm run dev
```

Events land in `.polish/analytics.db` (gitignored). Inspect them directly:

```bash
node -e "const {DatabaseSync}=require('node:sqlite'); \
  const db=new DatabaseSync('.polish/analytics.db'); \
  console.log(db.prepare('SELECT type, count(*) c FROM events GROUP BY type').all())"
```

To use a custom path (e.g. a tmpfs-backed location), set `POLISH_DB_PATH`.

---

## Production — Option A: Vercel Postgres / Neon (recommended)

Serverless Postgres with connection pooling, which matters because each
serverless invocation opens its own connection.

1. Create a database: **Vercel Dashboard → Storage → Create → Postgres**
   (Vercel provisions a [Neon](https://neon.tech) database), or sign up at
   neon.tech directly.
2. Copy the **pooled** connection string (host contains `-pooler`).
3. Add it to your environment:

   ```bash
   # Vercel: Project → Settings → Environment Variables
   POLISH_DATABASE_URL=postgres://user:password@ep-xxx-pooler.region.aws.neon.tech/polish?sslmode=require
   ```

4. Redeploy. The store creates the `events` table on first write.

### Schema (created automatically; shown for reference)

```sql
CREATE TABLE IF NOT EXISTS events (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT        NOT NULL,
  type        TEXT        NOT NULL,
  ts          BIGINT      NOT NULL,
  path        TEXT        NOT NULL,
  selector    TEXT,
  component   TEXT,
  text        TEXT,
  value       DOUBLE PRECISION,
  meta        JSONB,
  received_at BIGINT      NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_path    ON events(path);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
```

---

## Production — Option B: Turso (edge SQLite)

If you prefer to keep SQLite semantics at the edge, use
[Turso](https://turso.tech) (libSQL). Good when your app runs close to users and
you want low-latency reads.

```bash
turso db create polish
turso db show polish --url        # → POLISH_DATABASE_URL (libsql://...)
turso db tokens create polish     # → POLISH_DATABASE_AUTH_TOKEN
```

```bash
POLISH_DATABASE_URL=libsql://polish-you.turso.io
POLISH_DATABASE_AUTH_TOKEN=...
```

The same `events` schema applies (SQLite types, as in `store.ts`).

---

## Environment variable reference

| Variable                     | Required          | Purpose                                                       |
| ---------------------------- | ----------------- | ------------------------------------------------------------- |
| `POLISH_DATABASE_URL`        | Production        | Postgres or libSQL connection string. Presence selects it.    |
| `POLISH_DATABASE_AUTH_TOKEN` | Turso only        | Auth token for the libSQL database.                           |
| `POLISH_DB_PATH`             | No                | Custom local SQLite path (dev). Default `.polish/analytics.db`. |

No secrets ever live in `polish.config.ts` — that file is imported by the
browser. Connection strings and tokens are read from `process.env` on the
server only.

---

## Data retention & privacy

- Events carry **no PII**: sessions are random UUIDs (no fingerprinting), and
  only element *labels* are stored — never user-typed input.
- Prune old rows on whatever cadence you like, e.g. a scheduled job:

  ```sql
  DELETE FROM events WHERE received_at < (extract(epoch from now()) - 60*60*24*90) * 1000;
  ```

  (90-day retention; `received_at` is milliseconds since epoch.)
- The capture layer honors the browser's **Do Not Track** signal and the
  `sampleRate` config, so you can dial volume down without code changes.
