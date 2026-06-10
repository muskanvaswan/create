import type { Metadata } from "next";
import { getAllPosts } from "@/lib/api";
import { NotesApp } from "./_components/notes-app";

import "./globals.css";

export const metadata: Metadata = {
  title: "Notes",
  description: "My personal notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const notes = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    folder: post.folder ?? "Notes",
  }));

  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="theme-color" content="#1e1e1e" />
      </head>
      <body className="h-dvh overflow-hidden bg-gradient-to-br from-indigo-300 via-purple-300 to-rose-200 font-sans antialiased text-neutral-900 dark:from-[#352a5e] dark:via-[#241d3a] dark:to-[#161221] dark:text-neutral-100">
        <div className="h-full p-2 sm:p-3 lg:p-5">
          <div className="h-full overflow-hidden rounded-2xl bg-[#f4f4f3]/80 shadow-2xl ring-1 ring-black/10 backdrop-blur-2xl dark:bg-[#181818]/80 dark:ring-white/10 sm:rounded-[1.4rem]">
            <NotesApp notes={notes}>{children}</NotesApp>
          </div>
        </div>
      </body>
    </html>
  );
}
