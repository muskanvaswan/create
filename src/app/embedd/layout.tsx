import { getPublicPosts } from "@/lib/api";
import { NotesApp } from "@/app/_components/notes-app";
import { audioExists } from "@/lib/tts";

export default function EmbedLayout({
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
    hasAudio: audioExists(post.slug),
  }));

  // No GlassWindow: the app fills the whole viewport with no macOS window
  // chrome, so it can be dropped into an <iframe> cleanly.
  return (
    <div className="h-full w-full overflow-hidden bg-[#f2f2f7] dark:bg-black">
      <NotesApp notes={notes} basePath="/embedd" windowControls={false}>
        {children}
      </NotesApp>
    </div>
  );
}
