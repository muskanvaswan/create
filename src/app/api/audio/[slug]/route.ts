import fs from "fs";
import { NextResponse } from "next/server";
import { getPostBySlug, isHiddenPost } from "@/lib/api";
import { noteExists } from "@/lib/notes-store";
import { audioExists, audioPath } from "@/lib/tts";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, props: Params) {
  const { slug } = await props.params;
  if (!noteExists(slug) || !audioExists(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Audio for admin-only notes stays private even though the file exists.
  if (isHiddenPost(getPostBySlug(slug))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const audio = fs.readFileSync(audioPath(slug));
  return new NextResponse(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audio.byteLength),
      // Regenerated on every save, so always revalidate.
      "Cache-Control": "no-cache",
    },
  });
}
