import { Note } from "@/app/_components/note";
import { getAllPosts } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";

export default async function Index() {
  const latest = getAllPosts()[0];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-400">
        No Notes
      </div>
    );
  }

  const content = await markdownToHtml(latest.content || "");

  return (
    <div className="hidden sm:block">
      <Note title={latest.title} date={latest.date} contentHtml={content} />
    </div>
  );
}
