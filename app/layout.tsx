import type { Metadata } from "next";
import "./globals.css";
import { GAScript } from "@/components/ga-script";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://glm52-claude-code.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "GLM-5.2 Claude Code Setup: settings.json, Backup, Rollback",
  description:
    "Use GLM-5.2 in Claude Code safely. Minimal settings.json setup, prerequisites, backup, rollback, caveats, and official docs for Claude Code users testing GLM-5.2.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GLM-5.2 Claude Code Setup: settings.json, Backup, Rollback",
    description:
      "Use GLM-5.2 in Claude Code safely with minimal setup notes, backup, rollback, caveats, and official docs.",
    url: siteUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GLM-5.2 Claude Code Setup: settings.json, Backup, Rollback",
    description:
      "Minimal setup notes for Claude Code users testing GLM-5.2 through provider routing.",
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
