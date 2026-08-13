import type { Metadata } from "next";

import { createPolishdPage } from "@polishd/next/dashboard";

import { hasRegisteredPasskey, isAuthenticated } from "@/lib/auth";
import polishdConfig from "../../../polishd.config";
import { PolishLogin } from "./login";

// Next requires route-segment config to be statically declared in the page
// module itself — it can't be re-exported from the package.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polishd — What gets measured gets improved",
  robots: { index: false, follow: false },
};

// Same gate as before: skip auth in local dev (SQLite, no real visitors);
// require a passkey in production. The passkey login UI stays app-local.
// `config` tells the dashboard it is mounted at /polish, so its queries
// exclude their own route instead of the default /polishd.
export default createPolishdPage({
  config: polishdConfig,
  authenticate: async () =>
    process.env.NODE_ENV !== "production" || (await isAuthenticated()),
  unauthorized: <PolishLogin hasPasskey={hasRegisteredPasskey()} />,
});
