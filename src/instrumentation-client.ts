/**
 * Next.js native client instrumentation — runs once before the app hydrates.
 * Polishd's zero-config entry point on the browser side.
 */
import { initPolishd } from "@polishd/next/client";

import polishdConfig from "../polishd.config";

initPolishd(polishdConfig);
