export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  ogImage?: {
    url: string;
  };
  preview?: boolean;
};
