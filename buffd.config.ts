/**
 * Buffd configuration for this app.
 *
 * The cookie name and API route are pinned to their pre-rename values so this
 * deployment keeps behaving exactly as it did before Buffd was extracted into
 * @buffd/next — no Vercel env changes, no cookie reset, dashboard stays at
 * /polish. Production storage uses POLISH_DATABASE_URL, which the package reads
 * as a fallback (see @buffd/next server/store.ts). The local-dev SQLite file
 * lives at the package default (.buffd/analytics.db); to change it set the
 * BUFFD_DB_PATH env var (the store reads env/default, not this object).
 */
import { defineBuffdConfig } from "@buffd/next";

const buffdConfig = defineBuffdConfig({
  sessionCookie: "polish_session",
  apiRoute: "/api/polish",
});

export default buffdConfig;
