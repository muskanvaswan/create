import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Notes",
  description: "Muskan's Notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
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
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="macos-wallpaper h-dvh overflow-hidden font-sans antialiased text-neutral-900 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
