import { NextResponse } from "next/server";
import { HIDDEN_FOLDERS } from "@/lib/api";
import { readNote } from "@/lib/notes-store";
import { readAudio } from "@/lib/tts";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, props: Params) {
  const { slug } = await props.params;
  const note = await readNote(slug);
  // Audio for admin-only notes stays private even though the file exists.
  if (!note || HIDDEN_FOLDERS.includes(note.folder)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const audio = await readAudio(slug);
  if (!audio) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audio.byteLength),
      // Regenerated on every save, so always revalidate.
      "Cache-Control": "no-cache",
    },
  });
}
