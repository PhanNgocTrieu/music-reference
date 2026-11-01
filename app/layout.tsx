import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music Reference",
  description: "A music reference database for artists, releases, and tracks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
