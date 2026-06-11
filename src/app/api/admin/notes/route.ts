import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth";
import { slugify, writeNote } from "@/lib/notes-store";
import { syncNoteAudio } from "@/lib/tts";

export async function POST(req: NextRequest) {
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, folder, content } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  const note = {
    slug,
    title: title.trim(),
    folder: folder?.trim() || "Notes",
    content: content ?? "",
  };
  writeNote({ ...note, date: new Date().toISOString() });
  await syncNoteAudio(note);

  return NextResponse.json({ slug });
}
