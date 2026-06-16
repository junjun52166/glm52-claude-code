"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const configSnippet = `{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5.2[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.2[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.2[1m]",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "1000000"
  }
}`;

const backupCommand = "cp ~/.claude/settings.json ~/.claude/settings.json.bak_$(date +%F)";
const rollbackCommand =
  "cp ~/.claude/settings.json.bak_YYYY-MM-DD ~/.claude/settings.json";

const officialDocsUrl = "https://docs.z.ai/devpack/latest-model";

const sources = [
  {
    label: "Anthropic: Claude Code settings",
    href: "https://docs.anthropic.com/en/docs/claude-code/settings",
  },
  {
    label: "Anthropic: Claude Code model configuration",
    href: "https://docs.anthropic.com/en/docs/claude-code/model-config",
  },
  {
    label: "Z.ai: How to switch models in Claude Code",
    href: "https://docs.z.ai/devpack/latest-model",
  },
  {
    label: "Z.ai: Claude Code overview",
    href: "https://docs.z.ai/devpack/tool/claude",
  },
];

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[var(--shadow)] backdrop-blur md:p-10">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl leading-tight md:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 text-base leading-8 text-[var(--muted)] md:text-lg">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-[var(--line)] bg-[#201916] p-4 text-sm text-[#f6ecdf] md:p-5 md:text-[15px]">
      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-[#d5b8a2]">{language}</div>
      <pre className="m-0 whitespace-pre">{code}</pre>
    </div>
  );
}

export function LandingPage() {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const waitlistEmailRef = useRef<HTMLInputElement | null>(null);

  const subtlePoints = useMemo(
    () => [
      "A copy-ready settings.json alias block for GLM-5.2",
      "Backup, verification, and rollback steps in one place",
      "Built for Claude Code CLI users, not normal Claude app usage",
      "Official docs linked for every critical step",
    ],
    [],
  );

  useEffect(() => {
    let tracked = false;

    const handleScroll = () => {
      if (tracked) return;
      const scrollTop = window.scrollY + window.innerHeight;
      const height = document.documentElement.scrollHeight;
      if (height > 0 && scrollTop / height >= 0.75) {
        tracked = true;
        trackEvent("scroll_75", {
          event_area: "page",
          model: "glm-5.2",
          tool: "claude-code",
        });
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showWaitlistForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    waitlistEmailRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showWaitlistForm]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configSnippet);
      setCopied(true);
      setCopyMessage("Copied. Paste it into ~/.claude/settings.json.");
      trackEvent("copy_glm52_config", {
        event_area: "config",
        model: "glm-5.2",
        tool: "claude-code",
        config_type: "settings_json",
        provider: "zai",
        model_id: "glm-5.2[1m]",
      });
      window.setTimeout(() => setCopied(false), 2200);
      window.setTimeout(() => setCopyMessage(""), 2600);
    } catch {
      setCopied(false);
      setCopyMessage("Copy failed. Select the JSON block below and copy it manually.");
      window.setTimeout(() => setCopyMessage(""), 3200);
    }
  };

  const handleOfficialDocsClick = () => {
    trackEvent("official_docs_click", {
      event_area: "docs",
      model: "glm-5.2",
      tool: "claude-code",
      destination: "zai_docs",
      outbound: true,
    });
  };

  const handleWaitlistClick = () => {
    trackEvent("fallback_kit_waitlist_click", {
      event_area: "waitlist",
      model: "glm-5.2",
      tool: "claude-code",
      offer: "advanced_fallback_kit",
      price_intent: "unknown",
      status: "waitlist",
    });
    setShowWaitlistForm(true);
    setWaitlistSubmitted(false);
    setWaitlistMessage("");
  };

  const closeWaitlistForm = () => {
    setShowWaitlistForm(false);
    setWaitlistMessage("");
    setWaitlistSubmitted(false);
    setIsSubmitting(false);
  };

  const handleWaitlistSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setWaitlistMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          note,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not save your waitlist request.");
      }

      trackEvent("fallback_kit_waitlist_submit", {
        event_area: "waitlist",
        model: "glm-5.2",
        tool: "claude-code",
        has_note: note.trim().length > 0,
      });
      setEmail("");
      setNote("");
      setWaitlistSubmitted(true);
      setWaitlistMessage("You're on the list. We will email you when the advanced fallback kit is ready.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save your waitlist request.";
      setWaitlistSubmitted(false);
      setWaitlistMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSourceClick = (label: string) => {
    trackEvent("source_link_click", {
      event_area: "sources",
      model: "glm-5.2",
      tool: "claude-code",
      source_label: label,
      outbound: true,
    });
  };

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] md:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--accent-soft)] blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
                Fable 5 Suspended? Start Here
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl leading-none md:text-6xl">
                Try GLM-5.2 in Claude Code Without Breaking Your Setup
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                A 5-minute setup note for Claude Code users who want to test GLM-5.2
                after Fable 5 was suspended. Copy the settings.json block, keep a
                backup, verify the model, and roll back fast if it goes wrong.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] md:text-lg">
                This page is for one narrow job: if you use Claude Code CLI and need
                a temporary Fable 5 fallback, it shows the exact GLM-5.2 alias config,
                what else must already be set up, and how to undo the change cleanly.
              </p>
              <p className="mt-5 max-w-3xl rounded-[1.5rem] border border-[var(--line)] bg-white/60 px-5 py-4 text-sm leading-7 text-[var(--ink)] md:text-base">
                Using Claude in the web app, desktop app, or mobile app? You probably
                do not need this page. It is mainly for Claude Code CLI users editing
                <code className="mx-1">~/.claude/settings.json</code>.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[#231b18] p-5 text-[#f8eedf]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#d4ad91]">What You Get</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 md:text-base">
                {subtlePoints.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
            >
              {copied ? "Copied ✓" : "Copy GLM-5.2 Config"}
            </button>
            <a
              href={officialDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOfficialDocsClick}
              className="rounded-full border border-[var(--line)] bg-white/70 px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
            >
              Open Official Docs ↗
            </a>
            <button
              type="button"
              onClick={handleWaitlistClick}
              className="rounded-full border border-[var(--line)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-white/60"
            >
              Join Waitlist for Advanced Fallback Kit
            </button>
          </div>
          {copyMessage ? (
            <p className="mt-4 text-sm font-medium text-[var(--accent-strong)]">{copyMessage}</p>
          ) : null}
        </section>

        <div className="mt-8 grid gap-8">
          <Section eyebrow="Before You Start" title="What this page helps you do">
            <p className="rounded-[1.5rem] border border-[var(--line)] bg-white/60 px-5 py-4 text-[var(--ink)]">
              If you&apos;re looking for a Fable 5 alternative to run inside Claude
              Code, this page shows how to try GLM-5.2 as a temporary replacement,
              with backup and rollback steps.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/60 p-5">
                <h3 className="text-lg text-[var(--ink)]">You can use this page to</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Copy a ready-to-paste GLM-5.2 alias block for Claude Code</li>
                  <li>Check the prerequisites before you edit settings.json</li>
                  <li>Back up, verify, and roll back safely if the test fails</li>
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/60 p-5">
                <h3 className="text-lg text-[var(--ink)]">This page does not do</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Provider signup, billing, or API key creation</li>
                  <li>Full routing setup for every third-party provider</li>
                  <li>Any promise that GLM-5.2 behaves like native Anthropic models</li>
                  <li>Migration work for normal Claude app users</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section eyebrow="Who Needs This" title="For normal Claude app users: probably not you">
            <p>
              If you use Claude in the web app, desktop app, or mobile app, you
              probably do not need to edit any JSON files. Just switch to another
              available Claude model such as Opus or Sonnet.
            </p>
            <p>
              This page is mainly for Claude Code CLI users who intentionally want to
              test GLM-5.2 through provider routing.
            </p>
          </Section>

          <Section eyebrow="Prerequisites" title="Check these before you touch settings.json">
            <ul className="list-disc space-y-2 pl-5">
              <li>Claude Code installed</li>
              <li>A provider account that supports GLM-5.2</li>
              <li>The correct API key</li>
              <li>The correct base URL or provider routing setup</li>
              <li>Access to edit <code>~/.claude/settings.json</code></li>
              <li>A backup of your current settings</li>
            </ul>
            <p className="rounded-[1.5rem] border border-[var(--line)] bg-white/60 px-5 py-4 text-[var(--ink)]">
              The <code>settings.json</code> block below is not a complete provider
              setup. It only maps Claude Code aliases to GLM-5.2. Authentication and
              routing still depend on your provider setup.
            </p>
          </Section>

          <Section eyebrow="Step 1" title="Backup your current Claude Code settings">
            <CodeBlock code={backupCommand} language="bash" />
            <p>
              If the file does not exist yet, create it first or follow the official
              Claude Code settings documentation for your environment.
            </p>
          </Section>

          <Section eyebrow="Step 2" title="Add GLM-5.2 alias mapping">
            <CodeBlock code={configSnippet} language="json" />
            <ul className="list-disc space-y-2 pl-5">
              <li>This maps Claude Code aliases to <code>glm-5.2[1m]</code>.</li>
              <li>This does not replace your provider API key or base URL setup.</li>
              <li>Third-party provider behavior may differ from Anthropic-native models.</li>
              <li>Test this on a non-critical project first.</li>
            </ul>
          </Section>

          <Section eyebrow="Step 3" title="Confirm your active configuration">
            <p>
              After editing settings, restart Claude Code and run <code>/status</code>{" "}
              to inspect the active model and provider details.
            </p>
            <p>
              If the output does not match your expected provider or model, revert and
              check your API key, base URL, and provider documentation.
            </p>
          </Section>

          <Section eyebrow="Step 4" title="Roll back if anything breaks">
            <CodeBlock code={rollbackCommand} language="bash" />
            <p>Replace <code>YYYY-MM-DD</code> with your actual backup date.</p>
          </Section>

          <Section eyebrow="Caveats" title="Important limits and risk boundaries">
            <ul className="list-disc space-y-2 pl-5">
              <li>GLM-5.2 is not an official Anthropic replacement for Fable 5.</li>
              <li>This page is independent and source-backed.</li>
              <li>Provider behavior may differ in latency, context, and tool support.</li>
              <li>Model names, pricing, availability, and context behavior may change.</li>
              <li>Do not test this first on production-critical repositories.</li>
              <li>Always verify the latest provider details in official docs.</li>
            </ul>
          </Section>

          <Section eyebrow="Sources" title="Official references used for this page">
            <ul className="space-y-3">
              {sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleSourceClick(source.label)}
                    className="inline-flex rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-white"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section eyebrow="Last Verified" title="Verification notes">
            <p>Last verified: June 15, 2026.</p>
            <p>
              This page was written against the current Anthropic Claude Code settings
              docs and Z.ai Claude Code model-switch documentation available on that
              date.
            </p>
          </Section>

          <Section eyebrow="Disclaimer" title="Independent note, not vendor documentation">
            <p>
              This page is an independent setup note. It does not represent Anthropic,
              Z.ai, or any provider. Use it as a starting checklist, then confirm the
              latest behavior with official documentation before changing a real
              development environment.
            </p>
          </Section>
        </div>
      </div>
      {showWaitlistForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201916]/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[var(--shadow)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                  Advanced Fallback Kit
                </p>
                <h2 className="mt-3 text-2xl leading-tight md:text-3xl">
                  Join the waitlist
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">
                  Leave your email and we&apos;ll notify you when the fallback kit is ready.
                </p>
              </div>
              <button
                type="button"
                onClick={closeWaitlistForm}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
              >
                Close
              </button>
            </div>

            {waitlistSubmitted ? (
              <div className="mt-6 rounded-[1.75rem] border border-[var(--line)] bg-white/90 p-6 text-center shadow-[var(--shadow)]">
                <p className="text-2xl font-semibold text-[var(--ink)]">You&apos;re on the list.</p>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  We&apos;ll email you when the advanced fallback kit is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="mt-6 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    Email
                  </span>
                  <input
                    ref={waitlistEmailRef}
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    What are you waiting for? (Optional)
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="What would make this useful for you?"
                    rows={4}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>
                {waitlistMessage ? (
                  <p className="text-sm font-medium text-[var(--accent-strong)]">
                    {waitlistMessage}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 pt-2 md:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Saving..." : "Join Waitlist"}
                  </button>
                  <button
                    type="button"
                    onClick={closeWaitlistForm}
                    className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
                  >
                    Not now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
