import { NextResponse } from "next/server";
import { readFile } from "@/lib/content-store";

/**
 * Fallback for uploads that aren't in the deployed public/ directory yet:
 * files committed through the GitHub store only become static assets after
 * the next deploy, so until then they're served from the store. Static files
 * in public/ take precedence over this route.
 */

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  pdf: "application/pdf",
};

type Params = {
  params: Promise<{ name: string }>;
};

export async function GET(_req: Request, props: Params) {
  const { name } = await props.params;
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(name)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = await readFile(`public/assets/uploads/${name}`);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const extension = name.slice(name.lastIndexOf(".") + 1);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "Content-Length": String(file.byteLength),
      // Upload names are timestamped and never reused, so cache hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
