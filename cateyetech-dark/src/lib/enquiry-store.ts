import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Enquiry } from "./enquiry";

/**
 * Durable record of every accepted enquiry, appended as JSON Lines.
 *
 * This is the safety net: if SMTP is down or unconfigured, the enquiry is
 * still on disk rather than lost. Point ENQUIRY_LOG_PATH at a persistent
 * volume in production — on a host with an ephemeral filesystem the file
 * disappears with the instance, so treat mail as the primary channel there.
 */

const DEFAULT_PATH = ".data/enquiries.jsonl";

export type StoredEnquiry = Enquiry & {
  receivedAt: string;
  delivered: boolean;
};

export async function storeEnquiry(record: StoredEnquiry): Promise<boolean> {
  const path = resolve(process.env.ENQUIRY_LOG_PATH ?? DEFAULT_PATH);

  try {
    await mkdir(dirname(path), { recursive: true });
    await appendFile(path, `${JSON.stringify(record)}\n`, "utf8");
    return true;
  } catch (error) {
    console.error("[contact] could not persist enquiry:", error);
    return false;
  }
}
