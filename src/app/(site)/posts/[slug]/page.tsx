import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPosts, getPostBySlug, isHiddenPost, postExists } from "@/lib/api";
import { audioExists } from "@/lib/tts";
import markdownToHtml from "@/lib/markdownToHtml";
import { Note } from "@/app/_components/note";
import { Post as PostType } from "@/interfaces/post";

function getPublicPost(slug: string): PostType | null {
  if (!postExists(slug)) return null;
  const post = getPostBySlug(slug);
  return isHiddenPost(post) ? null : post;
}

function getPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/[*_~`#>]/g, "") // emphasis / heading markers
    .replace(/\s+/g, " ")
    .trim();
}

function ellipsise(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trimEnd() + "…";
}

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPublicPost(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <Note
      title={post.title}
      date={post.date}
      contentHtml={content}
      audioSrc={audioExists(post.slug) ? `/api/audio/${post.slug}` : null}
    />
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
  const description = ellipsise(getPlainText(post.content || ""));

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const posts = getPublicPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
