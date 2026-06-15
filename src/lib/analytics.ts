export const PAGE_SLUG = "glm-5-2-claude-code";
export const PAGE_TYPE = "validation_page";
export const EXPERIMENT = "glm52_claude_code_v1";

type EventParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    page_slug: PAGE_SLUG,
    page_type: PAGE_TYPE,
    experiment: EXPERIMENT,
    ...params,
  });
}
