import matter from "gray-matter";
import { deleteFile, listDir, readFile, writeFile } from "@/lib/content-store";

/**
 * Runtime note access for the admin editor and API routes. Reads go through
 * the content store (GitHub in production) so freshly saved notes are visible
 * before the next deploy; build-time rendering of public pages keeps using
 * the synchronous helpers in lib/api.ts.
 */

const POSTS_DIR = "_posts";
const FOLDERS_PATH = "data/folders.json";

export type StoredNote = {
  slug: string;
  title: string;
  date: string;
  folder: string;
  content: string;
};

export async function slugify(title: string): Promise<string> {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "note";
  const taken = new Set(await listDir(POSTS_DIR));
  let slug = base;
  let n = 2;
  while (taken.has(`${slug}.md`)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

function makeExcerpt(content: string): string {
  const firstLine =
    content
      .split("\n")
      .map((line) => line.replace(/^[#>\-*\s]+/, "").trim())
      .find((line) => line.length > 0) ?? "";
  return firstLine.length > 160 ? `${firstLine.slice(0, 157)}...` : firstLine;
}

export async function writeNote({
  slug,
  title,
  folder,
  content,
  date,
}: StoredNote): Promise<void> {
  const file = matter.stringify(content, {
    title,
    excerpt: makeExcerpt(content),
    date,
    folder,
  });
  await writeFile(`${POSTS_DIR}/${slug}.md`, file, `admin: save note "${slug}"`);
}

export async function readNote(slug: string): Promise<StoredNote | null> {
  if (!isValidSlug(slug)) return null;
  const file = await readFile(`${POSTS_DIR}/${slug}.md`);
  if (!file) return null;
  const { data, content } = matter(file.toString("utf8"));
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    folder: data.folder ?? "Notes",
    content,
  };
}

export async function listNotes(): Promise<StoredNote[]> {
  const names = await listDir(POSTS_DIR);
  const notes = await Promise.all(
    names
      .filter((name) => name.endsWith(".md"))
      .map((name) => readNote(name.replace(/\.md$/, ""))),
  );
  return notes
    .filter((note): note is StoredNote => note !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function noteExists(slug: string): Promise<boolean> {
  return (await readNote(slug)) !== null;
}

export async function deleteNote(slug: string): Promise<void> {
  await deleteFile(`${POSTS_DIR}/${slug}.md`, `admin: delete note "${slug}"`);
}

export async function loadFolders(): Promise<string[]> {
  const file = await readFile(FOLDERS_PATH);
  if (!file) return [];
  return JSON.parse(file.toString("utf8")) as string[];
}

export async function saveFolder(name: string): Promise<string[]> {
  const folders = await loadFolders();
  if (!folders.includes(name)) {
    folders.push(name);
    await writeFile(
      FOLDERS_PATH,
      JSON.stringify(folders, null, 2),
      `admin: add folder "${name}"`,
    );
  }
  return folders;
}
