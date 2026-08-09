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
});

export default polishdConfig;
