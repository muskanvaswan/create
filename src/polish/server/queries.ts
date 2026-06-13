/**
 * Polish — dashboard aggregations (server only).
 *
 * Read-side queries over the events table. These power the `/polish` dashboard
 * and, later, feed the Stage-2 synthesis prompt. Everything degrades to empty
 * results when the store is in no-op mode, so the dashboard always renders.
 */
import { db_ } from "./store";

export interface OverviewStats {
  ready: boolean;
  totalEvents: number;
  sessions: number;
  pageViews: number;
  rageClicks: number;
  deadClicks: number;
  jsErrors: number;
}

export interface FrictionPage {
  path: string;
  sessions: number;
  pageViews: number;
  rageClicks: number;
  deadClicks: number;
  jsErrors: number;
  avgScrollDepth: number | null;
  /** Composite friction score; higher = worse. */
  score: number;
}

export interface RecentError {
  path: string;
  message: string;
  component?: string;
  ts: number;
}

export interface FrictionElement {
  /** The component name (from data-component) or, failing that, the selector. */
  label: string;
  /** True when `label` is a real component name, false when it's a raw selector. */
  isComponent: boolean;
  /** A representative DOM selector for this element. */
  selector: string | null;
  /** A sample of the element's visible text (label), if any. */
  sampleText: string | null;
  /** How many distinct pages this element was interacted with on. */
  pages: number;
  clicks: number;
  rageClicks: number;
  deadClicks: number;
  /** Composite friction score; higher = worse. */
  score: number;
}

function num(row: Record<string, unknown> | undefined, key: string): number {
  const v = row?.[key];
  return typeof v === "number" ? v : 0;
}

export function getOverview(): OverviewStats {
  const db = db_();
  if (!db) {
    return {
      ready: false,
      totalEvents: 0,
      sessions: 0,
      pageViews: 0,
      rageClicks: 0,
      deadClicks: 0,
      jsErrors: 0,
    };
  }
  const row = db
    .prepare(
      `SELECT
         COUNT(*)                                          AS totalEvents,
         COUNT(DISTINCT session_id)                        AS sessions,
         SUM(type = 'page_view')                           AS pageViews,
         SUM(type = 'rage_click')                          AS rageClicks,
         SUM(type = 'dead_click')                          AS deadClicks,
         SUM(type = 'js_error')                            AS jsErrors
       FROM events`,
    )
    .get() as Record<string, unknown>;

  return {
    ready: true,
    totalEvents: num(row, "totalEvents"),
    sessions: num(row, "sessions"),
    pageViews: num(row, "pageViews"),
    rageClicks: num(row, "rageClicks"),
    deadClicks: num(row, "deadClicks"),
    jsErrors: num(row, "jsErrors"),
  };
}

/**
 * Friction ranking. Weights match the build plan's guidance — rage clicks are
 * the strongest frustration signal, then dead clicks and errors; shallow
 * scroll (content not reached) contributes mildly.
 */
export function getFrictionPages(limit = 5): FrictionPage[] {
  const db = db_();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT
         path,
         COUNT(DISTINCT session_id)                       AS sessions,
         SUM(type = 'page_view')                          AS pageViews,
         SUM(type = 'rage_click')                         AS rageClicks,
         SUM(type = 'dead_click')                         AS deadClicks,
         SUM(type = 'js_error')                           AS jsErrors,
         AVG(CASE WHEN type = 'scroll_depth' THEN value END) AS avgScrollDepth
       FROM events
       GROUP BY path`,
    )
    .all() as Array<Record<string, unknown>>;

  return rows
    .map((r): FrictionPage => {
      const rageClicks = num(r, "rageClicks");
      const deadClicks = num(r, "deadClicks");
      const jsErrors = num(r, "jsErrors");
      const avg = r.avgScrollDepth;
      const avgScrollDepth = typeof avg === "number" ? Math.round(avg) : null;
      const shallowPenalty =
        avgScrollDepth !== null && avgScrollDepth < 50 ? (50 - avgScrollDepth) / 25 : 0;
      const score =
        rageClicks * 3 + deadClicks * 2 + jsErrors * 2.5 + shallowPenalty;
      return {
        path: r.path as string,
        sessions: num(r, "sessions"),
        pageViews: num(r, "pageViews"),
        rageClicks,
        deadClicks,
        jsErrors,
        avgScrollDepth,
        score: Math.round(score * 10) / 10,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Per-element interaction breakdown. Groups every click-type event by its
 * component (the `data-component` hint Polish walks up the DOM for) or, when no
 * component is annotated, by its selector path. This is the data that makes
 * Stage 2 synthesis possible: it tells you *which UI element* the friction is
 * on, not just which page.
 */
export function getFrictionElements(limit = 12): FrictionElement[] {
  const db = db_();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT
         COALESCE(component, selector, '(unknown)')                  AS label,
         MAX(component IS NOT NULL)                                   AS isComponent,
         MAX(selector)                                               AS selector,
         MAX(text)                                                   AS sampleText,
         COUNT(DISTINCT path)                                        AS pages,
         SUM(type = 'click')                                         AS clicks,
         SUM(type = 'rage_click')                                    AS rageClicks,
         SUM(type = 'dead_click')                                    AS deadClicks
       FROM events
       WHERE type IN ('click', 'rage_click', 'dead_click')
       GROUP BY label`,
    )
    .all() as Array<Record<string, unknown>>;

  return rows
    .map((r): FrictionElement => {
      const rageClicks = num(r, "rageClicks");
      const deadClicks = num(r, "deadClicks");
      const clicks = num(r, "clicks");
      return {
        label: r.label as string,
        isComponent: num(r, "isComponent") === 1,
        selector: (r.selector as string) ?? null,
        sampleText: (r.sampleText as string) ?? null,
        pages: num(r, "pages"),
        clicks,
        rageClicks,
        deadClicks,
        score: Math.round((rageClicks * 3 + deadClicks * 2) * 10) / 10,
      };
    })
    // Surface elements that have friction first, then the most-clicked ones.
    .sort((a, b) => b.score - a.score || b.clicks - a.clicks)
    .slice(0, limit);
}

export function getRecentErrors(limit = 10): RecentError[] {
  const db = db_();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT path, component, meta, ts
       FROM events WHERE type = 'js_error'
       ORDER BY id DESC LIMIT ?`,
    )
    .all(limit) as Array<Record<string, unknown>>;
  return rows.map((r) => {
    let message = "Unknown error";
    if (typeof r.meta === "string") {
      try {
        const m = JSON.parse(r.meta) as { message?: unknown };
        if (typeof m.message === "string") message = m.message;
      } catch {
        /* ignore malformed meta */
      }
    }
    return {
      path: r.path as string,
      component: (r.component as string) ?? undefined,
      message,
      ts: r.ts as number,
    };
  });
}
