/**
 * Polish — analytics store (server only).
 *
 * Backed by SQLite via Node's built-in `node:sqlite` (Node 22+), so there is
 * zero npm dependency and no native build step. The store opens lazily and is
 * deliberately fault-tolerant: if the filesystem is read-only (e.g. Vercel's
 * serverless runtime) the open fails once, we log, and every operation becomes
 * a safe no-op. Capture must never take the host app down.
 *
 * Production with real traffic should point Polish at Postgres/Turso instead;
 * that swap lives behind this same interface (a future `pgStore`), selected by
 * the POLISH_DATABASE_URL env var. For Phase 1 (local validation) SQLite is it.
 */
import { DatabaseSync } from "node:sqlite";
import { dirname, isAbsolute, join } from "node:path";
import { mkdirSync } from "node:fs";

import { defaultPolishConfig } from "../config";
import type { PolishEvent, PolishEventRow } from "../shared/types";

type DB = InstanceType<typeof DatabaseSync>;

/** null = not yet opened; false = open failed, stay no-op; DB = ready. */
let db: DB | null | false = null;

function resolveDbPath(): string {
  const configured = process.env.POLISH_DB_PATH || defaultPolishConfig.databasePath;
  return isAbsolute(configured) ? configured : join(process.cwd(), configured);
}

/** Open the DB once. On failure (read-only FS, etc.) latch to no-op mode. */
function getDb(): DB | null {
  if (db === false) return null;
  if (db) return db;
  // A networked database is requested but the adapter isn't wired up yet.
  // Don't silently fall back to an ephemeral local SQLite file in production —
  // that would look like it's working while dropping data on each cold start.
  // Latch to no-op with a loud, actionable message instead. See DATABASE.md.
  if (process.env.POLISH_DATABASE_URL) {
    console.warn(
      "[polish] POLISH_DATABASE_URL is set but the Postgres/libSQL adapter is " +
        "not implemented yet — capture is disabled. See src/polish/DATABASE.md.",
    );
    db = false;
    return null;
  }
  try {
    const path = resolveDbPath();
    mkdirSync(dirname(path), { recursive: true });
    const opened = new DatabaseSync(path);
    opened.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id  TEXT    NOT NULL,
        type        TEXT    NOT NULL,
        ts          INTEGER NOT NULL,
        path        TEXT    NOT NULL,
        selector    TEXT,
        component   TEXT,
        text        TEXT,
        value       REAL,
        meta        TEXT,
        received_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_events_path ON events(path);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    `);
    db = opened;
    return db;
  } catch (err) {
    console.warn(
      "[polish] analytics store unavailable, capture disabled:",
      err instanceof Error ? err.message : err,
    );
    db = false;
    return null;
  }
}

/** True when events are actually being persisted (used by the dashboard). */
export function storeReady(): boolean {
  return getDb() !== null;
}

/** Persist a batch of events for one session. Silently drops if no store. */
export function insertEvents(sessionId: string, events: PolishEvent[]): number {
  const database = getDb();
  if (!database || events.length === 0) return 0;
  const now = Date.now();
  const stmt = database.prepare(`
    INSERT INTO events
      (session_id, type, ts, path, selector, component, text, value, meta, received_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let written = 0;
  // node:sqlite has no .transaction() helper; wrap manually for batch speed.
  database.exec("BEGIN");
  try {
    for (const e of events) {
      stmt.run(
        sessionId,
        e.type,
        e.ts,
        e.path,
        e.selector ?? null,
        e.component ?? null,
        e.text ?? null,
        e.value ?? null,
        e.meta ? JSON.stringify(e.meta) : null,
        now,
      );
      written++;
    }
    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
  return written;
}

/** Raw rows, newest first. For debugging and the queries layer. */
export function allRows(limit = 1000): PolishEventRow[] {
  const database = getDb();
  if (!database) return [];
  const rows = database
    .prepare(`SELECT * FROM events ORDER BY id DESC LIMIT ?`)
    .all(limit) as Array<Record<string, unknown>>;
  return rows.map(deserialize);
}

/** The live query handle, for the aggregation layer. null in no-op mode. */
export function db_(): DB | null {
  return getDb();
}

function deserialize(row: Record<string, unknown>): PolishEventRow {
  return {
    id: row.id as number,
    session_id: row.session_id as string,
    type: row.type as PolishEventRow["type"],
    ts: row.ts as number,
    path: row.path as string,
    selector: (row.selector as string) ?? undefined,
    component: (row.component as string) ?? undefined,
    text: (row.text as string) ?? undefined,
    value: (row.value as number) ?? undefined,
    meta: row.meta ? (JSON.parse(row.meta as string) as PolishEventRow["meta"]) : undefined,
    received_at: row.received_at as number,
  };
}
