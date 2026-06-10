"use client";

import cn from "classnames";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NoteListItem = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

type Props = {
  notes: NoteListItem[];
};

export function NotesSidebar({ notes }: Props) {
  const pathname = usePathname();
  const isNoteOpen = pathname.startsWith("/posts/");
  const activeSlug = isNoteOpen
    ? decodeURIComponent(pathname.slice("/posts/".length))
    : notes[0]?.slug;

  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-r border-black/10 bg-[#fafaf9] dark:border-white/10 dark:bg-[#262626] sm:flex sm:w-72 lg:w-80",
        isNoteOpen ? "hidden" : "flex",
      )}
    >
      <h1 className="px-5 pb-1 pt-4 text-[22px] font-bold">Notes</h1>
      <ul className="flex-1 overflow-y-auto px-3 pb-2">
        {notes.map((note) => {
          const isActive = note.slug === activeSlug;
          return (
            <li key={note.slug}>
              <Link
                href={`/posts/${note.slug}`}
                className={cn(
                  "block rounded-lg px-3 py-2.5",
                  isActive
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
                    isActive
                      ? "text-neutral-700 dark:text-neutral-200"
                      : "text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  <span className="mr-2 tabular-nums">
                    {format(parseISO(note.date), "M/d/yy")}
                  </span>
                  {note.excerpt}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-black/10 py-2 text-center text-xs text-neutral-500 dark:border-white/10 dark:text-neutral-400">
        {notes.length} {notes.length === 1 ? "Note" : "Notes"}
      </p>
    </aside>
  );
}
