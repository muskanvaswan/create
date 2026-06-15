import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import { listNotes, loadFolders } from "@/lib/notes-store";
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
        <AdminLogin />
      </GlassWindow>
    );
  }

  const notes = await listNotes();

  const folders = [
    ...new Set([
      "Notes",
      "Drafts",
      ...(await loadFolders()),
      ...notes.map((note) => note.folder),
    ]),
  ].sort();

  return (
    <GlassWindow>
      <Editor initialNotes={notes} initialFolders={folders} />
    </GlassWindow>
  );
}
