import type { NextRequest } from "next/server";

import { withPolishSession } from "@/polish/session";

/**
 * Root proxy (Next.js 16's replacement for `middleware.ts`). Currently
 * delegates entirely to Polish, which assigns the anonymous analytics session
 * cookie. Compose additional logic here by threading the same NextResponse
 * through each helper.
 */
export function proxy(request: NextRequest) {
  return withPolishSession(request);
}

export const config = {
  // Run only on page navigations — never on `/api`, static assets, or images.
  // The proxy's sole job is assigning the session cookie, which pages trigger;
  // API routes don't need it. Excluding all of `/api` is also load-bearing:
  // under Next 16 + Turbopack, letting the proxy match any `/api/*` route
  // breaks route resolution for the whole `/api` segment (404s). This is Next's
  // officially recommended matcher shape.
  matcher: ["/((?!api|_next/static|_next/image|favicon|assets).*)"],
};
