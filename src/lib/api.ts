import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function postExists(slug: string): boolean {
  return (
    /^[a-z0-9][a-z0-9-]*$/.test(slug) &&
    fs.existsSync(join(postsDirectory, `${slug}.md`))
  );
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

// Folders that exist only in the admin editor, never on the public site.
export const HIDDEN_FOLDERS = ["Drafts"];

export function isHiddenPost(post: Post): boolean {
  return HIDDEN_FOLDERS.includes(post.folder ?? "Notes");
}

export function getPublicPosts(): Post[] {
  return getAllPosts().filter((post) => !isHiddenPost(post));
}
