import type { Metadata } from "next";

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
        {children}
      </body>
    </html>
  );
}
