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
