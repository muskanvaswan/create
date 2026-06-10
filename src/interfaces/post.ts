export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  folder?: string;
  coverImage?: string;
  ogImage?: {
    url: string;
  };
  preview?: boolean;
};
