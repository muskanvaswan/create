import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth";
import { slugify, writeNote } from "@/lib/notes-store";

export async function POST(req: NextRequest) {
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, folder, content } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  writeNote({
    slug,
    title: title.trim(),
    folder: folder?.trim() || "Notes",
    content: content ?? "",
    date: new Date().toISOString(),
  });

  return NextResponse.json({ slug });
}
