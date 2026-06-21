/**
 * Next.js native client instrumentation — runs once before the app hydrates.
 * Buffd's zero-config entry point on the browser side.
 */
import { initBuffd } from "@buffd/next/client";

import buffdConfig from "../buffd.config";

initBuffd(buffdConfig);
