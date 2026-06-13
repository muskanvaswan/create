/**
 * Next.js native client instrumentation — runs once before the app hydrates.
 * This is Polish's zero-config entry point on the browser side.
 */
import { initPolish } from "@/polish/client/init";
import polishConfig from "../polish.config";

initPolish(polishConfig);
