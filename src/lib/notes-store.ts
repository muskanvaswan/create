import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");
const foldersPath = join(process.cwd(), "data", "folders.json");

export function slugify(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "note";
  let slug = base;
  let n = 2;
  while (fs.existsSync(join(postsDirectory, `${slug}.md`))) {
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

export function writeNote({
  slug,
  title,
  folder,
  content,
  date,
}: {
  slug: string;
  title: string;
  folder: string;
  content: string;
  date: string;
}): void {
  const file = matter.stringify(content, {
    title,
    excerpt: makeExcerpt(content),
    date,
    folder,
  });
  fs.writeFileSync(join(postsDirectory, `${slug}.md`), file);
}

export function noteExists(slug: string): boolean {
  return isValidSlug(slug) && fs.existsSync(join(postsDirectory, `${slug}.md`));
}

export function loadFolders(): string[] {
  if (!fs.existsSync(foldersPath)) return [];
  return JSON.parse(fs.readFileSync(foldersPath, "utf8")) as string[];
}

export function saveFolder(name: string): string[] {
  const folders = loadFolders();
  if (!folders.includes(name)) {
    folders.push(name);
    fs.mkdirSync(join(process.cwd(), "data"), { recursive: true });
    fs.writeFileSync(foldersPath, JSON.stringify(folders, null, 2));
  }
  return folders;
}
