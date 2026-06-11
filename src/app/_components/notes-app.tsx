"use client";

import cn from "classnames";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CheckIcon,
  ChecklistIcon,
  FolderIcon,
  MoreIcon,
  PaperclipIcon,
  SearchIcon,
  ShareIcon,
  SidebarIcon,
  TableIcon,
} from "./icons";
import { Pill } from "./pill";
import { TrafficLights } from "./traffic-lights";
import { ListenButton } from "./listen-button";

type NoteListItem = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  folder: string;
  hasAudio?: boolean;
};

type Props = {
  notes: NoteListItem[];
  children: React.ReactNode;
};

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

/** Editing actions are read-only on the published site, so they render disabled. */
function DisabledIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex h-7 w-9 cursor-not-allowed items-center justify-center text-neutral-400 opacity-60 dark:text-neutral-500"
      aria-disabled="true"
    >
      {children}
    </span>
  );
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to clipboard if the user dismissed the share sheet
      }
    }
    let copiedOk = true;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      copiedOk = document.execCommand("copy");
      textarea.remove();
    }
    if (copiedOk) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      onClick={share}
      title="Share this note"
      className="flex h-7 w-9 items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
    >
      {copied ? <CheckIcon className="h-[18px] w-[18px] text-green-600 dark:text-green-400" /> : <ShareIcon />}
    </button>
  );
}

export function NotesApp({ notes, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  const changeFolder = (newFolder: string | null) => {
    setFolder(newFolder);
    const newVisible = notes.filter((note) => {
      if (newFolder && note.folder !== newFolder) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        note.title.toLowerCase().includes(q) ||
        note.excerpt.toLowerCase().includes(q)
      );
    });
    if (newVisible.length > 0) {
      router.push(`/posts/${newVisible[0].slug}`);
    } else {
      router.push("/");
    }
  };

  const isNoteOpen = pathname.startsWith("/posts/");
  const now = useMemo(() => new Date(), []);

  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      counts.set(note.folder, (counts.get(note.folder) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [notes]);

  const visible = notes.filter((note) => {
    if (folder && note.folder !== folder) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.excerpt.toLowerCase().includes(q)
    );
  });

  const grouped = new Map<string, NoteListItem[]>();
  for (const note of visible) {
    const bucket = dateBucket(parseISO(note.date), now);
    const items = grouped.get(bucket) ?? [];
    items.push(note);
    grouped.set(bucket, items);
  }
  const groups = [...grouped.entries()];

  const activeSlug = isNoteOpen
    ? decodeURIComponent(pathname.slice("/posts/".length))
    : visible[0]?.slug;

  const activeNote = notes.find((note) => note.slug === activeSlug);

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
              {sidebarToggle}
            </div>
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
              <p className="px-2.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500/80 dark:text-neutral-400/50">
                Folders
              </p>
              <ul className="space-y-0.5">
                <li>
                  <FolderRow
                    label="All Notes"
                    count={notes.length}
                    active={folder === null}
                    onClick={() => changeFolder(null)}
                  />
                </li>
                {folders.map(([name, count]) => (
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
              isNoteOpen ? "hidden sm:flex sm:w-72 lg:w-80" : "flex w-full sm:w-72 lg:w-80",
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
              <Pill className="hidden sm:flex">
                <DisabledIcon>
                  <MoreIcon />
                </DisabledIcon>
              </Pill>
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
              "h-full flex-grow grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-4",
              isNoteOpen ? "grid" : "hidden sm:grid"
            )}
          >
            {/* Left section: empty/placeholder (matches compose button alignment) */}
            <div className="flex justify-start" />

            {/* Middle section: Formatting icons */}
            <div className="flex justify-center">
              <Pill className="hidden md:flex">
                <DisabledIcon>
                  <span className="text-[15px] font-medium leading-none">Aa</span>
                </DisabledIcon>
                <DisabledIcon>
                  <ChecklistIcon />
                </DisabledIcon>
                <DisabledIcon>
                  <TableIcon />
                </DisabledIcon>
                <DisabledIcon>
                  <PaperclipIcon />
                </DisabledIcon>
              </Pill>
            </div>

            {/* Right section: Share, Search Bar */}
            <div className="flex items-center justify-end gap-2">
              <Pill>
                {activeNote && activeNote.hasAudio && (
                  <>
                    <ListenButton src={`/api/audio/${activeNote.slug}`} />
                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />
                  </>
                )}
                <ShareButton title={activeNote?.title ?? "Notes"} />
              </Pill>
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

        <div className="flex min-h-0 flex-1">
          {/* Notes list */}
          <aside
            className={cn(
              "w-full shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white/40 px-3 pb-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex sm:w-72 lg:w-80",
              isNoteOpen ? "hidden sm:flex" : "flex",
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
                      <NoteRow
                        note={note}
                        now={now}
                        active={note.slug === activeSlug}
                        showFolder={folder === null}
                      />
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
 
          <main className="min-w-0 flex-1 overflow-y-auto bg-white/80 dark:bg-[#1e1e1e]/80">
            {children}
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
 
function NoteRow({
  note,
  now,
  active,
  showFolder,
}: {
  note: NoteListItem;
  now: Date;
  active: boolean;
  showFolder: boolean;
}) {
  return (
    <Link
      href={`/posts/${note.slug}`}
      className={cn(
        "block rounded-xl px-3 py-2.5",
        active
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
          active
            ? "text-neutral-700 dark:text-neutral-200"
            : "text-neutral-500 dark:text-neutral-400",
        )}
      >
        <span className="mr-2 tabular-nums">
          {rowDate(parseISO(note.date), now)}
        </span>
        {note.excerpt}
      </p>
      {showFolder && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1.5 text-[13px]",
            active
              ? "text-neutral-700 dark:text-neutral-200"
              : "text-neutral-500 dark:text-neutral-400",
          )}
        >
          <FolderIcon className="h-[14px] w-[14px]" />
          {note.folder}
        </p>
      )}
    </Link>
  );
}
