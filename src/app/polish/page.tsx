import type { Metadata } from "next";

import { createBuffdPage } from "@buffd/next/dashboard";

import { hasRegisteredPasskey, isAuthenticated } from "@/lib/auth";
import { PolishLogin } from "./login";

// Next requires route-segment config to be statically declared in the page
// module itself — it can't be re-exported from the package.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polish — Friction Dashboard",
  robots: { index: false, follow: false },
};

// Same gate as before: skip auth in local dev (SQLite, no real visitors);
// require a passkey in production. The passkey login UI stays app-local.
export default createBuffdPage({
  authenticate: async () =>
    process.env.NODE_ENV !== "production" || (await isAuthenticated()),
  unauthorized: <PolishLogin hasPasskey={hasRegisteredPasskey()} />,
});
