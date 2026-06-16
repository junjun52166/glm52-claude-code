import type { Metadata } from "next";
import "./globals.css";
import { GAScript } from "@/components/ga-script";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://glm52-claude-code.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Try GLM-5.2 in Claude Code After Fable 5 Suspension",
  description:
    "Fable 5 was suspended. This page shows Claude Code users how to try GLM-5.2 with a copy-ready settings.json block, backup steps, rollback steps, and official docs.",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Try GLM-5.2 in Claude Code After Fable 5 Suspension",
    description:
      "A copy-ready GLM-5.2 setup note for Claude Code users with backup, rollback, and official docs.",
    url: siteUrl,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Try GLM-5.2 in Claude Code after Fable 5 suspension",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Try GLM-5.2 in Claude Code After Fable 5 Suspension",
    description:
      "Copy-ready GLM-5.2 setup, backup, rollback, and docs for Claude Code users.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GAScript />
        {children}
      </body>
    </html>
  );
}
