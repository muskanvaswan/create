import { getPublicPosts } from "@/lib/api";
import { GlassWindow } from "@/app/_components/glass-window";
import { NotesApp } from "@/app/_components/notes-app";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const notes = getPublicPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    folder: post.folder ?? "Notes",
  }));

  return (
    <GlassWindow>
      <NotesApp notes={notes}>{children}</NotesApp>
    </GlassWindow>
  );
}
