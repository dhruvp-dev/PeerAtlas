/**
 * Track a custom Clarity event.
 * Safe to call in any environment (SSR/Client) — no-ops when Clarity is not loaded or during server-side rendering.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  
  // Microsoft Clarity initializes a global `clarity` function
  const clarity = (window as any).clarity;
  if (typeof clarity === "function") {
    clarity("event", eventName, properties);
  }
}

// Typed convenience wrappers for PeerAtlas events
export const Analytics = {
  /**
   * Track when a user views a specific question paper
   */
  paperView: (subject: string, semester: number, paperId: string) =>
    trackEvent("paper_view", { subject, semester, paperId }),

  /**
   * Track when a user downloads a question paper
   */
  paperDownload: (paperId: string, subject: string) =>
    trackEvent("paper_download", { paperId, subject }),

  /**
   * Track searches performed by users
   */
  searchPerformed: (query: string, resultCount: number) =>
    trackEvent("search_performed", { query, resultCount }),

  /**
   * Track custom filters applied in the browse section
   */
  browseFilterApplied: (filter: string, value: string) =>
    trackEvent("browse_filter_applied", { filter, value }),

  /**
   * Track when a paper link/details are shared
   */
  paperShared: (paperId: string, subject: string, method: string) =>
    trackEvent("paper_shared", { paperId, subject, method }),
};
