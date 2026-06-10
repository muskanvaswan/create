"use client";

import cn from "classnames";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import markdownToHtml from "@/lib/markdownToHtml";
import markdownStyles from "@/app/_components/markdown-styles.module.css";
import { FolderIcon } from "@/app/_components/icons";

type AdminNote = {
  slug: string;
  title: string;
  date: string;
  folder: string;
  content: string;
};

type Props = {
  initialNotes: AdminNote[];
  initialFolders: string[];
};

type Draft = {
  title: string;
  folder: string;
  content: string;
};

const NEW_NOTE = "__new__";

function TrafficLights() {
  return (
    <span className="flex gap-2" aria-hidden="true">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </span>
  );
}

export function Editor({ initialNotes, initialFolders }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [folders, setFolders] = useState(initialFolders);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const open = (slug: string) => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    const note = notes.find((n) => n.slug === slug);
    if (!note) return;
    setSelected(slug);
    setDraft({ title: note.title, folder: note.folder, content: note.content });
    setDirty(false);
    setPreviewHtml(null);
    setError(null);
  };

  const openNew = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setSelected(NEW_NOTE);
    setDraft({ title: "", folder: folders[0] ?? "Notes", content: "" });
    setDirty(false);
    setPreviewHtml(null);
    setError(null);
  };

  const close = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setSelected(null);
    setDraft(null);
    setDirty(false);
  };

  const edit = (patch: Partial<Draft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setDirty(true);
    setPreviewHtml(null);
  };

  const save = async () => {
    if (!draft || !draft.title.trim()) {
      setError("A title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const isNew = selected === NEW_NOTE;
      const res = await fetch(
        isNew ? "/api/admin/notes" : `/api/admin/notes/${selected}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      if (!res.ok) {
        throw new Error((await res.json()).error ?? "Save failed");
      }
      const { slug } = await res.json();
      const saved: AdminNote = {
        slug,
        title: draft.title.trim(),
        folder: draft.folder,
        content: draft.content,
        date: isNew
          ? new Date().toISOString()
          : notes.find((n) => n.slug === slug)?.date ?? new Date().toISOString(),
      };
      setNotes((prev) => {
        const rest = prev.filter((n) => n.slug !== slug);
        return [saved, ...rest].sort((a, b) => (a.date > b.date ? -1 : 1));
      });
      setSelected(slug);
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const togglePreview = async () => {
    if (previewHtml !== null) {
      setPreviewHtml(null);
    } else if (draft) {
      setPreviewHtml(await markdownToHtml(draft.content));
    }
  };

  const addFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const res = await fetch("/api/admin/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { folders: updated } = await res.json();
      setFolders([...new Set([...updated, ...folders])].sort());
      setNewFolderName("");
      setAddingFolder(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  const isOpen = selected !== null && draft !== null;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-black/10 px-4 dark:border-white/10">
        <TrafficLights />
        <div>
          <p className="text-[15px] font-semibold leading-tight">Editor</p>
          <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <a
          href="/"
          className="ml-auto text-sm text-[#e0a30c] hover:underline"
        >
          View site
        </a>
        <button
          onClick={logout}
          className="rounded-full border border-black/10 bg-gradient-to-b from-white/80 to-white/40 px-4 py-1.5 text-sm shadow-md dark:border-white/15 dark:from-white/[0.12] dark:to-white/[0.05]"
        >
          Lock
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Notes list */}
        <aside
          className={cn(
            "w-full shrink-0 flex-col overflow-y-auto border-r border-black/10 px-3 pb-4 dark:border-white/10 sm:flex sm:w-72 lg:w-80",
            isOpen ? "hidden sm:flex" : "flex",
          )}
        >
          <div className="flex items-center gap-2 pb-2 pt-3">
            <button
              onClick={openNew}
              className="flex-1 rounded-full bg-[#e0a30c] px-4 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-[#c89209] dark:bg-[#a17321] dark:hover:bg-[#b5832a]"
            >
              New Note
            </button>
            <button
              onClick={() => setAddingFolder((v) => !v)}
              className="rounded-full border border-black/10 bg-gradient-to-b from-white/80 to-white/40 px-4 py-1.5 text-sm shadow-md dark:border-white/15 dark:from-white/[0.12] dark:to-white/[0.05]"
            >
              New Folder
            </button>
          </div>
          {addingFolder && (
            <div className="flex items-center gap-2 pb-2">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFolder()}
                placeholder="Folder name"
                className="w-full rounded-lg border border-black/10 bg-white/60 px-3 py-1.5 text-sm outline-none dark:border-white/15 dark:bg-white/10"
              />
              <button
                onClick={addFolder}
                className="text-sm font-medium text-[#e0a30c]"
              >
                Add
              </button>
            </div>
          )}
          <ul>
            {notes.map((note) => (
              <li key={note.slug}>
                <button
                  onClick={() => open(note.slug)}
                  className={cn(
                    "block w-full rounded-xl px-3 py-2.5 text-left",
                    selected === note.slug
                      ? "bg-[#fed87a] dark:bg-[#a17321]"
                      : "hover:bg-black/5 dark:hover:bg-white/5",
                  )}
                >
                  <p className="truncate text-[15px] font-semibold leading-snug">
                    {note.title}
                  </p>
                  <p
                    className={cn(
                      "flex items-center gap-1.5 truncate text-[13px] leading-snug",
                      selected === note.slug
                        ? "text-neutral-700 dark:text-neutral-200"
                        : "text-neutral-500 dark:text-neutral-400",
                    )}
                  >
                    <span className="tabular-nums">
                      {format(parseISO(note.date), "dd/MM/yy")}
                    </span>
                    <FolderIcon className="h-[14px] w-[14px] shrink-0" />
                    {note.folder}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor pane */}
        <main className="min-w-0 flex-1 overflow-hidden bg-white/80 dark:bg-[#1e1e1e]/80">
          {!isOpen || !draft ? (
            <div className="hidden h-full items-center justify-center text-neutral-400 sm:flex">
              Select a note to edit, or create a new one
            </div>
          ) : (
            <div className="flex h-full flex-col gap-3 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={close}
                  className="text-[15px] font-medium text-[#e0a30c] sm:hidden"
                >
                  ‹ Notes
                </button>
                <select
                  value={draft.folder}
                  onChange={(e) => edit({ folder: e.target.value })}
                  className="rounded-lg border border-black/10 bg-white/60 px-2 py-1.5 text-sm outline-none dark:border-white/15 dark:bg-[#2a2a2a]"
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <button
                  onClick={togglePreview}
                  className={cn(
                    "rounded-full border border-black/10 px-4 py-1.5 text-sm shadow-sm dark:border-white/15",
                    previewHtml !== null
                      ? "bg-[#fed87a] font-medium dark:bg-[#a17321]"
                      : "bg-gradient-to-b from-white/80 to-white/40 dark:from-white/[0.12] dark:to-white/[0.05]",
                  )}
                >
                  Preview
                </button>
                <div className="ml-auto flex items-center gap-3">
                  {error && (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </span>
                  )}
                  {savedFlash && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Saved
                    </span>
                  )}
                  <button
                    onClick={save}
                    disabled={saving || !dirty}
                    className="rounded-full bg-[#e0a30c] px-5 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-[#c89209] disabled:opacity-40 dark:bg-[#a17321] dark:hover:bg-[#b5832a]"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
              <input
                value={draft.title}
                onChange={(e) => edit({ title: e.target.value })}
                placeholder="Title"
                className="w-full bg-transparent text-[26px] font-bold leading-tight outline-none placeholder:text-neutral-400"
              />
              {previewHtml !== null ? (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div
                    className={markdownStyles["markdown"]}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                <textarea
                  value={draft.content}
                  onChange={(e) => edit({ content: e.target.value })}
                  placeholder="Write in markdown..."
                  className="min-h-0 w-full flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-neutral-400"
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
