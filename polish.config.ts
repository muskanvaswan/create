/**
 * Polish configuration for this app.
 *
 * This is the one file a builder edits to tune Polish. It re-exports a single
 * config object consumed by both the browser capture layer and the server.
 * Only non-secret settings belong here — keys and database URLs are read from
 * environment variables on the server (see README / src/polish/server/store.ts).
 */
import { definePolishConfig } from "./src/polish/config";

const polishConfig = definePolishConfig({
  // Defaults are sensible for a low-traffic personal site. Override as needed:
  // sampleRate: 1,
  // rageClick: { count: 3, windowMs: 500 },
});

export default polishConfig;
