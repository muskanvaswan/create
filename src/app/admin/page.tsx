import type { Metadata } from "next";
import { getAllPosts } from "@/lib/api";
import { hasRegisteredPasskey, isAuthenticated } from "@/lib/auth";
import { loadFolders } from "@/lib/notes-store";
import { GlassWindow } from "@/app/_components/glass-window";
import { AdminLogin } from "./login";
import { Editor } from "./editor";

export const metadata: Metadata = {
  title: "Notes — Editor",
  robots: { index: false },
};

// Always render fresh: auth state and note files change at runtime.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    return (
      <GlassWindow>
        <AdminLogin canRegister={!hasRegisteredPasskey()} />
      </GlassWindow>
    );
  }

  const notes = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    folder: post.folder ?? "Notes",
    content: post.content,
  }));

  const folders = [
    ...new Set([
      "Notes",
      "Drafts",
      ...loadFolders(),
      ...notes.map((note) => note.folder),
    ]),
  ].sort();

  return (
    <GlassWindow>
      <Editor initialNotes={notes} initialFolders={folders} />
    </GlassWindow>
  );
}
