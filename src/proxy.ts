import { createPolishdProxy } from "@polishd/next/proxy";

import polishdConfig from "../polishd.config";

/**
 * Root proxy (Next.js 16's replacement for `middleware.ts`). Delegates to Polishd,
 * which assigns the anonymous analytics session cookie (legacy `polish_session`
 * name, from polishd.config). Thread additional logic through here if needed.
 */
const { proxy } = createPolishdProxy(polishdConfig);

export { proxy };

// Next statically parses `config.matcher`, so it MUST be an inline literal here
// — it can't be imported. Excluding all of `/api` is load-bearing: under Next 16
// + Turbopack, a proxy matcher that touches any `/api/*` route breaks the entire
// `/api` segment (every route 404s).
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|assets).*)"],
};
