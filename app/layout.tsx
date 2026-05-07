import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sysnotes by JFL",
  description: "Release notes and website change updates for modern product teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
