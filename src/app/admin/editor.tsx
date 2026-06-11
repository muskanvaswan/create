"use client";

import cn from "classnames";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChecklistIcon,
  ComposeIcon,
  FolderIcon,
  MoreIcon,
  NewFolderIcon,
  PaperclipIcon,
  SearchIcon,
  ShareIcon,
  SidebarIcon,
  TableIcon,
} from "@/app/_components/icons";
import markdownStyles from "@/app/_components/markdown-styles.module.css";
import { Pill } from "@/app/_components/pill";
import { TrafficLights } from "@/app/_components/traffic-lights";
import htmlToMarkdown from "@/lib/htmlToMarkdown";
import markdownToHtml from "@/lib/markdownToHtml";
import { FormatMenu, FormatState } from "./format-menu";

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
};

const NEW_NOTE = "__new__";

const TABLE_HTML =
  "<table><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead>" +
  "<tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>";

const CHECKLIST_HTML =
  '<ul><li><input type="checkbox">&nbsp;</li></ul>';

function dateBucket(date: Date, now: Date): string {
  const days = differenceInCalendarDays(now, date);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return "Previous 7 Days";
  if (days <= 30) return "Previous 30 Days";
  if (date.getFullYear() === now.getFullYear()) return format(date, "MMMM");
  return format(date, "yyyy");
}

function rowDate(date: Date, now: Date): string {
  const days = differenceInCalendarDays(now, date);
  if (days <= 0) return format(date, "h:mm a");
  if (days === 1) return "Yesterday";
  if (days <= 7) return format(date, "EEEE");
  return format(date, "dd/MM/yy");
}

/** First content line of a note, stripped of markdown tokens, for list previews. */
function previewLine(markdown: string): string {
  const line = markdown
    .split("\n")
    .map((l) => l.replace(/^[#>\s]+|^[-*]\s(\[[ x]\]\s)?|^\d+\.\s/g, "").trim())
    .find((l) => l.length > 0);
  return line ?? "No additional text";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readFormatState(): FormatState {
  return {
    block: document.queryCommandValue("formatBlock").toLowerCase(),
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    strike: document.queryCommandState("strikeThrough"),
    ul: document.queryCommandState("insertUnorderedList"),
    ol: document.queryCommandState("insertOrderedList"),
  };
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      // Keep focus (and the text selection) in the note while clicking tools.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-9 items-center justify-center text-neutral-600 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

export function Editor({ initialNotes, initialFolders }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [folders, setFolders] = useState(initialFolders);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftHtml, setDraftHtml] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [formatState, setFormatState] = useState<FormatState | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  // Tracks which slug is currently being loaded so stale async results are ignored.
  const loadingSlug = useRef<string | null>(null);
  const now = useMemo(() => new Date(), []);

  // The note body is an uncontrolled contentEditable: React never re-renders
  // its contents, we load HTML into it imperatively when a note is opened.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== draftHtml) {
      editorRef.current.innerHTML = draftHtml;
    }
  }, [selected, draftHtml]);

  // Close the "More" dropdown when the user clicks anywhere outside it.
  const moreRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [moreOpen]);

  // Keep the Aa menu's checkmarks in sync with wherever the caret is.
  useEffect(() => {
    if (!formatOpen) return;
    const update = () => setFormatState(readFormatState());
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [formatOpen]);

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of folders) counts.set(f, 0);
    for (const note of notes) {
      counts.set(note.folder, (counts.get(note.folder) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [notes, folders]);

  const visible = notes.filter((note) => {
    if (folder && note.folder !== folder) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  const grouped = new Map<string, AdminNote[]>();
  for (const note of visible) {
    const bucket = dateBucket(parseISO(note.date), now);
    const items = grouped.get(bucket) ?? [];
    items.push(note);
    grouped.set(bucket, items);
  }
  const groups = [...grouped.entries()];

  const isOpen = selected !== null && draft !== null;
  const openNote = notes.find((n) => n.slug === selected);

  const confirmDiscard = () => !dirty || confirm("Discard unsaved changes?");

  const changeFolder = async (newFolder: string | null) => {
    if (!confirmDiscard()) return;
    setFolder(newFolder);
    setMoreOpen(false);

    const newVisible = notes.filter((note) => {
      if (newFolder && note.folder !== newFolder) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
      );
    });

    if (newVisible.length > 0) {
      const note = newVisible[0];
      // Set selection state before the async conversion (same reason as in open()).
      loadingSlug.current = note.slug;
      setSelected(note.slug);
      setDraft({ title: note.title, folder: note.folder });
      setDraftHtml("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      setDirty(false);
      setError(null);
      setFormatOpen(false);
      const html = await markdownToHtml(note.content);
      if (loadingSlug.current !== note.slug) return;
      setDraftHtml(html);
      if (editorRef.current) editorRef.current.innerHTML = html;
    } else {
      setSelected(null);
      setDraft(null);
      setDraftHtml("");
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  };

  const open = async (slug: string) => {
    if (!confirmDiscard()) return;
    const note = notes.find((n) => n.slug === slug);
    if (!note) return;
    // Update selection state synchronously before the async conversion so that
    // openNote always reflects the note the user intends to work with.
    // This prevents removeNote from targeting the stale previous selection if
    // the "More" dropdown is triggered during the markdownToHtml call.
    loadingSlug.current = slug;
    setSelected(slug);
    setDraft({ title: note.title, folder: note.folder });
    setDraftHtml("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setDirty(false);
    setError(null);
    setFormatOpen(false);
    setMoreOpen(false);
    const html = await markdownToHtml(note.content);
    if (loadingSlug.current !== slug) return;
    setDraftHtml(html);
    if (editorRef.current) editorRef.current.innerHTML = html;
  };

  const openNew = () => {
    if (!confirmDiscard()) return;
    setSelected(NEW_NOTE);
    setDraft({ title: "", folder: folder ?? "Notes" });
    setDraftHtml("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setDirty(false);
    setError(null);
    setFormatOpen(false);
  };

  const close = () => {
    if (!confirmDiscard()) return;
    setSelected(null);
    setDraft(null);
    setDirty(false);
    setFormatOpen(false);
  };

  const edit = (patch: Partial<Draft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setDirty(true);
  };

  /** Run an editing command against the contentEditable note body. */
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false, value);
    setDirty(true);
    setFormatState(readFormatState());
  };

  const rememberSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const attach = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) {
      setError("Upload failed");
      return;
    }
    const { path, isImage } = await res.json();
    const name = escapeHtml(file.name);
    editorRef.current?.focus();
    restoreSelection();
    exec(
      "insertHTML",
      isImage
        ? `<img src="${path}" alt="${name}">`
        : `<a href="${path}">${name}</a>`,
    );
  };

  const save = async () => {
    if (!draft || !draft.title.trim()) {
      setError("A title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const content = htmlToMarkdown(editorRef.current?.innerHTML ?? "");
      const isNew = selected === NEW_NOTE;
      const res = await fetch(
        isNew ? "/api/admin/notes" : `/api/admin/notes/${selected}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, content }),
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
        content,
        date: isNew
          ? new Date().toISOString()
          : notes.find((n) => n.slug === slug)?.date ?? new Date().toISOString(),
      };
      setNotes((prev) =>
        [saved, ...prev.filter((n) => n.slug !== slug)].sort((a, b) =>
          a.date > b.date ? -1 : 1,
        ),
      );
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

  const removeNote = async () => {
    if (!openNote || !confirm(`Delete "${openNote.title}"?`)) return;
    const res = await fetch(`/api/admin/notes/${openNote.slug}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    setNotes((prev) => prev.filter((n) => n.slug !== openNote.slug));
    setSelected(null);
    setDraft(null);
    setDirty(false);
    setMoreOpen(false);
    router.refresh();
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
      const { folders: saved } = await res.json();
      setFolders([...new Set([...folders, ...saved])]);
      setNewFolderName("");
      setAddingFolder(false);
    }
  };

  const share = async () => {
    if (!openNote) return;
    const url = `${location.origin}/posts/${openNote.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: openNote.title, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore; nothing sensible to do without clipboard access
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  const sidebarToggle = (
    <button
      onClick={() => setSidebarHidden((hidden) => !hidden)}
      title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
      className="hidden h-8 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white lg:flex"
    >
      <SidebarIcon className="h-[18px] w-[18px]" />
    </button>
  );

  return (
    <div className="flex h-full">
      {/* Folders pane */}
      {!sidebarHidden && (
        <div className="hidden w-56 shrink-0 flex-col bg-white/40 dark:bg-white/[0.02] lg:flex">
          <aside className="flex-grow flex flex-col my-2 ml-2 mr-0 rounded-2xl border border-black/[0.18] dark:border-white/[0.15] bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md dark:from-white/[0.02] dark:to-transparent shadow-lg">
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <TrafficLights />
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setAddingFolder((v) => !v)}
                  title="New folder"
                  className="flex h-8 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <NewFolderIcon className="h-[18px] w-[18px]" />
                </button>
                {sidebarToggle}
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
              <p className="px-2.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500/80 dark:text-neutral-400/50">
                Folders
              </p>
              {addingFolder && (
                <div className="flex items-center gap-2 px-1 pb-2">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFolder()}
                    placeholder="Folder name"
                    className="w-full rounded-lg border border-black/10 bg-white/60 px-2 py-1 text-sm outline-none dark:border-white/15 dark:bg-white/10"
                  />
                  <button
                    onClick={addFolder}
                    className="text-sm font-medium text-[#e0a30c]"
                  >
                    Add
                  </button>
                </div>
              )}
              <ul className="space-y-0.5">
                <li>
                  <FolderRow
                    label="All Notes"
                    count={notes.length}
                    active={folder === null}
                    onClick={() => changeFolder(null)}
                  />
                </li>
                {folderCounts.map(([name, count]) => (
                  <li key={name}>
                    <FolderRow
                      label={name}
                      count={count}
                      active={folder === name}
                      onClick={() => changeFolder(name)}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <header className="flex h-14 shrink-0 items-center border-b border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
          {/* Notes list header part */}
          <div
            className={cn(
              "h-full shrink-0 items-center border-r border-black/10 dark:border-white/10",
              isOpen ? "hidden sm:flex sm:w-72 lg:w-80" : "flex w-full sm:w-72 lg:w-80",
              "px-3 sm:px-4"
            )}
          >
            <div className="flex flex-1 items-center justify-between min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn(sidebarHidden ? "flex" : "lg:hidden")}>
                  <TrafficLights />
                </span>
                {sidebarHidden && sidebarToggle}
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold leading-tight">
                    {folder ?? "All Notes"}
                  </p>
                  <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
                    {visible.length} {visible.length === 1 ? "note" : "notes"}
                  </p>
                </div>
              </div>
              <span ref={moreRef} className="relative hidden sm:block">
                <Pill>
                  <ToolbarButton
                    label="More"
                    onClick={() => setMoreOpen((v) => !v)}
                  >
                    <MoreIcon />
                  </ToolbarButton>
                </Pill>
                {moreOpen && (
                  <span className="absolute right-0 top-full z-10 mt-1.5 block w-44 rounded-xl border border-black/10 bg-white/95 py-1 shadow-xl backdrop-blur dark:border-white/15 dark:bg-[#2a2a2a]/95">
                    <button
                      onClick={removeNote}
                      disabled={!openNote}
                      className="block w-full px-4 py-1.5 text-left text-sm text-red-600 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-white/5"
                    >
                      Delete Note
                    </button>
                    <button
                      onClick={logout}
                      className="block w-full px-4 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      Lock Editor
                    </button>
                  </span>
                )}
              </span>
              <label className="flex sm:hidden h-9 w-full max-w-32 items-center gap-2 rounded-full border border-black/10 bg-gradient-to-b from-white/80 to-white/40 px-3 shadow-md dark:border-white/15 dark:from-white/[0.12] dark:to-white/[0.05]">
                <SearchIcon className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                <input
                  type="search"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </label>
            </div>
          </div>

          {/* Editor header part */}
          <div
            className={cn(
              "flex h-full flex-grow items-center gap-3 px-3 sm:px-4 min-w-0",
              isOpen ? "flex" : "hidden sm:flex"
            )}
          >
            {/* Left section: New Note button */}
            <div className="shrink-0 flex justify-start">
              <Pill className="hidden sm:flex">
                <ToolbarButton label="New note" onClick={openNew}>
                  <ComposeIcon />
                </ToolbarButton>
              </Pill>
            </div>

            {/* Left-middle spacer */}
            <div className="flex-1 min-w-0" />

            {/* Middle section: Formatting tools */}
            <div className="shrink-0 flex justify-center">
              <span className="relative hidden md:block">
                <Pill>
                  <ToolbarButton
                    label="Text format"
                    onClick={() => {
                      setFormatState(readFormatState());
                      setFormatOpen((v) => !v);
                    }}
                    disabled={!isOpen}
                  >
                    <span className="text-[15px] font-medium leading-none">
                      Aa
                    </span>
                  </ToolbarButton>
                  <ToolbarButton
                    label="Checklist"
                    onClick={() => exec("insertHTML", CHECKLIST_HTML)}
                    disabled={!isOpen}
                  >
                    <ChecklistIcon />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Table"
                    onClick={() => exec("insertHTML", TABLE_HTML)}
                    disabled={!isOpen}
                  >
                    <TableIcon />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Attach file"
                    onClick={() => {
                      rememberSelection();
                      fileRef.current?.click();
                    }}
                    disabled={!isOpen}
                  >
                    <PaperclipIcon />
                  </ToolbarButton>
                </Pill>
                {formatOpen && formatState && (
                  <FormatMenu
                    state={formatState}
                    onInline={(command) => exec(command)}
                    onBlock={(tag) => exec("formatBlock", tag)}
                    onList={(command) => exec(command)}
                    onClose={() => setFormatOpen(false)}
                  />
                )}
              </span>
            </div>

            {/* Middle-right spacer */}
            <div className="flex-1 min-w-0" />

            {/* Right section: Share, Save, Search Bar */}
            <div className="shrink-0 flex items-center justify-end gap-2">
              <Pill className="hidden md:flex">
                <ToolbarButton label="Share" onClick={share} disabled={!openNote}>
                  <ShareIcon />
                </ToolbarButton>
              </Pill>
              <button
                onClick={save}
                disabled={!isOpen || saving || !dirty}
                className="rounded-full bg-[#e0a30c] px-5 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-[#c89209] disabled:opacity-40 dark:bg-[#a17321] dark:hover:bg-[#b5832a]"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <label className="hidden sm:flex h-9 w-full max-w-32 items-center gap-2 rounded-full border border-black/10 bg-gradient-to-b from-white/80 to-white/40 px-3 shadow-md dark:border-white/15 dark:from-white/[0.12] dark:to-white/[0.05] sm:max-w-44 lg:max-w-56">
                <SearchIcon className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                <input
                  type="search"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </label>
            </div>
          </div>
        </header>

        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) attach(file);
            e.target.value = "";
          }}
        />

        <div className="flex min-h-0 flex-1">
          {/* Notes list */}
          <aside
            className={cn(
              "w-full shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white/40 px-3 pb-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex sm:w-72 lg:w-80",
              isOpen ? "hidden sm:flex" : "flex",
            )}
          >
            {groups.map(([bucket, items]) => (
              <section key={bucket}>
                <h2 className="px-2 pb-1 pt-4 text-[15px] font-bold">
                  {bucket}
                </h2>
                <ul>
                  {items.map((note, i) => (
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
                            "truncate text-[13px] leading-snug",
                            selected === note.slug
                              ? "text-neutral-700 dark:text-neutral-200"
                              : "text-neutral-500 dark:text-neutral-400",
                          )}
                        >
                          <span className="mr-2 tabular-nums">
                            {rowDate(parseISO(note.date), now)}
                          </span>
                          {previewLine(note.content)}
                        </p>
                        {folder === null && (
                          <p
                            className={cn(
                              "mt-1 flex items-center gap-1.5 text-[13px]",
                              selected === note.slug
                                ? "text-neutral-700 dark:text-neutral-200"
                                : "text-neutral-500 dark:text-neutral-400",
                            )}
                          >
                            <FolderIcon className="h-[14px] w-[14px]" />
                            {note.folder}
                          </p>
                        )}
                      </button>
                      {i < items.length - 1 && (
                        <div className="mx-3 h-px bg-black/5 dark:bg-white/5" />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {visible.length === 0 && (
              <p className="pt-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No notes found
              </p>
            )}
          </aside>

          {/* Note editor pane */}
          <main className="min-w-0 flex-1 overflow-y-auto bg-white/80 dark:bg-[#1e1e1e]/80">
            {!isOpen || !draft ? (
              <div className="hidden h-full items-center justify-center text-neutral-400 sm:flex">
                Select a note, or create one with the compose button
              </div>
            ) : (
              <div className="flex h-full w-full flex-col pb-6">
                <div className="flex items-center pt-3 px-6 sm:hidden">
                  <button
                    onClick={close}
                    className="text-[15px] font-medium text-[#e0a30c]"
                  >
                    ‹ Notes
                  </button>
                </div>
                <div className="flex items-center justify-center gap-3 pb-4 pt-5 text-xs text-neutral-400 dark:text-neutral-500 w-full">
                  <span>
                    {format(
                      openNote ? parseISO(openNote.date) : now,
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </span>
                  <select
                    value={draft.folder}
                    onChange={(e) => edit({ folder: e.target.value })}
                    title="Folder"
                    className="rounded-md border border-black/10 bg-transparent px-1.5 py-0.5 text-xs outline-none dark:border-white/15 dark:bg-[#2a2a2a]"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {savedFlash && (
                    <span className="text-green-600 dark:text-green-400">
                      Saved
                    </span>
                  )}
                  {error && (
                    <span className="text-red-600 dark:text-red-400">
                      {error}
                    </span>
                  )}
                </div>
                <div className="flex w-full flex-col pl-6 pr-6 sm:pl-10 sm:pr-10 lg:pl-14 lg:pr-14 flex-1 min-h-0">
                  <input
                    value={draft.title}
                    onChange={(e) => edit({ title: e.target.value })}
                    placeholder="Title"
                    className="mb-4 w-full bg-transparent text-[26px] font-bold leading-tight outline-none placeholder:text-neutral-400"
                  />
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Start writing..."
                    onInput={() => setDirty(true)}
                    className={cn(
                      markdownStyles["markdown"],
                      "min-h-0 w-full flex-1 overflow-y-auto pb-10 outline-none",
                      "empty:before:text-neutral-400 empty:before:content-[attr(data-placeholder)]",
                    )}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FolderRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] transition-colors duration-150",
        active
          ? "bg-[#ecae12] text-white font-semibold"
          : "text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5",
      )}
    >
      <FolderIcon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          active ? "text-white" : "text-neutral-500 dark:text-neutral-400"
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={cn(
          "text-[13px] font-medium tabular-nums",
          active ? "text-white/80" : "text-neutral-400 dark:text-neutral-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}
