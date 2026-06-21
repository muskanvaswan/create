import { createBuffdRoute } from "@buffd/next/route";

import buffdConfig from "../../../../buffd.config";

// node:sqlite / pg need the Node runtime — never the Edge runtime.
export const runtime = "nodejs";
// This route mutates per-request; it must never be statically cached.
export const dynamic = "force-dynamic";

// Kept at /api/polish (matching buffd.config.apiRoute) so the client keeps
// flushing to the same endpoint it always has.
export const POST = createBuffdRoute(buffdConfig);
