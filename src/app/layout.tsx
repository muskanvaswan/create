import type { Metadata } from "next";
import { getAllPosts } from "@/lib/api";
import { NotesSidebar } from "./_components/notes-sidebar";
import { ThemeSwitcher } from "./_components/theme-switcher";

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
  }));

  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className="h-dvh overflow-hidden font-sans antialiased bg-white text-neutral-900 dark:bg-[#1e1e1e] dark:text-neutral-100">
        <div className="flex h-full flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/10 bg-[#f3f2f1] px-4 dark:border-white/10 dark:bg-[#2c2c2c]">
            <span className="flex gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </span>
            <span className="ml-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Notes
            </span>
            <span className="ml-auto">
              <ThemeSwitcher />
            </span>
          </header>
          <div className="flex min-h-0 flex-1">
            <NotesSidebar notes={notes} />
            <main className="min-w-0 flex-1 overflow-y-auto bg-white dark:bg-[#1e1e1e]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
