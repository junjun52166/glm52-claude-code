import { LandingPage } from "@/components/landing-page";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Try GLM-5.2 in Claude Code After Fable 5 Suspension",
    description:
      "A copy-ready GLM-5.2 setup note for Claude Code users with backup, rollback, and official docs.",
    datePublished: "2026-06-15",
    dateModified: "2026-06-16",
    author: {
      "@type": "Person",
      name: "junjun52166",
    },
    publisher: {
      "@type": "Organization",
      name: "GLM52 Claude Code",
    },
    about: [
      {
        "@type": "Thing",
        name: "Fable 5",
      },
      {
        "@type": "Thing",
        name: "GLM-5.2",
      },
      {
        "@type": "SoftwareApplication",
        name: "Claude Code",
      },
    ],
    mainEntityOfPage: "https://glm52-claude-code.vercel.app/",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
