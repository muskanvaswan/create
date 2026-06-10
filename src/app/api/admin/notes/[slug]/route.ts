import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/api";
import { isAuthenticatedRequest } from "@/lib/auth";
import { noteExists, writeNote } from "@/lib/notes-store";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function PUT(req: NextRequest, props: Params) {
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await props.params;
  if (!noteExists(slug)) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const { title, folder, content } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Keep the original creation date so the public list order stays stable.
  const existing = getPostBySlug(slug);
  writeNote({
    slug,
    title: title.trim(),
    folder: folder?.trim() || "Notes",
    content: content ?? "",
    date: existing.date,
  });

  return NextResponse.json({ slug });
}
