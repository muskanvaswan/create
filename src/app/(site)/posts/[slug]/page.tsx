import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPosts, getPostBySlug, isHiddenPost } from "@/lib/api";
import { noteExists } from "@/lib/notes-store";
import markdownToHtml from "@/lib/markdownToHtml";
import { Note } from "@/app/_components/note";
import { Post as PostType } from "@/interfaces/post";

function getPublicPost(slug: string): PostType | null {
  if (!noteExists(slug)) return null;
  const post = getPostBySlug(slug);
  return isHiddenPost(post) ? null : post;
}

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPublicPost(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <>
      <nav className="sticky top-0 bg-white/90 px-3 py-2 backdrop-blur dark:bg-[#1e1e1e]/90 sm:hidden">
        <Link
          href="/"
          className="text-[15px] font-medium text-[#e0a30c]"
        >
          ‹ Notes
        </Link>
      </nav>
      <Note title={post.title} date={post.date} contentHtml={content} />
    </>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPublicPost(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} — Notes`;

  return {
    title,
    openGraph: {
      title,
      ...(post.ogImage?.url ? { images: [post.ogImage.url] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const posts = getPublicPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
