/**
 * Polishd configuration for this app.
 *
 * The cookie name and API route are pinned to their pre-rename values so this
 * deployment keeps behaving exactly as it did before Polishd was extracted into
 * @polishd/next — no Vercel env changes, no cookie reset, dashboard stays at
 * /polish. Production storage uses POLISH_DATABASE_URL, which the package reads
 * as a fallback (see @polishd/next server/store.ts). The local-dev SQLite file
 * lives at the package default (.polishd/analytics.db); to change it set the
 * POLISHD_DB_PATH env var (the store reads env/default, not this object).
 */
import { definePolishdConfig } from "@polishd/next";

const polishdConfig = definePolishdConfig({
  sessionCookie: "polish_session",
  apiRoute: "/api/polish",
  // The dashboard lives at /polish here (pre-rename URL), not the package
  // default /polishd. Without this, every layer treats /polish as a page of
  // the site: the client captures dashboard clicks and design-scans the
  // dashboard itself, and the dashboard's own queries rank it as a top page.
  // Threaded into initPolishd, createPolishdRoute, AND createPolishdPage —
  // the page registration is what the read-side queries rely on.
  dashboardRoute: "/polish",
});

export default polishdConfig;
