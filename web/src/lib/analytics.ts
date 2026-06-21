import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePostHogAnalytics, PostHogEvents } from "./posthog";

// Client-side helper to generate/retrieve a persistent visitor ID
export function getOrGenerateAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("peeratlas_anonymous_id");
  if (!id) {
    id = "anon_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("peeratlas_anonymous_id", id);
  }
  return id;
}

// Client-side helper to generate/retrieve a session ID (expires when tab is closed)
export function getOrGenerateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("peeratlas_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("peeratlas_session_id", id);
  }
  return id;
}

/**
 * React hook to dispatch tracking events to both PostHog and Convex database.
 * Automatically enriches the properties with anonymousId, sessionId, and referrer.
 */
export function useAnalytics() {
  const logConvexEvent = useMutation(api.analytics.logEvent);
  const { trackEvent: trackPostHog } = usePostHogAnalytics();

  const track = <T extends keyof PostHogEvents>(
    eventName: T,
    properties: PostHogEvents[T]
  ) => {
    if (typeof window === "undefined") return;

    const anonymousId = getOrGenerateAnonymousId();
    const sessionId = getOrGenerateSessionId();
    const referrer = document.referrer || "";

    // 1. Dispatch to PostHog
    try {
      trackPostHog(eventName, properties);
    } catch (e) {
      console.error("PostHog event capture failed:", e);
    }

    // 2. Dispatch to Convex (which is our own server and not blocked by ad blockers)
    const enrichedProperties = {
      ...(properties as any),
      referrer,
    };

    logConvexEvent({
      name: eventName,
      properties: enrichedProperties,
      anonymousId,
      sessionId,
    }).catch((err) => {
      console.error(`Failed to log Convex event "${eventName}":`, err);
    });

    // 3. Fallback to Clarity events if applicable
    try {
      const clarity = (window as any).clarity;
      if (typeof clarity === "function") {
        clarity("event", eventName, properties);
      }
    } catch (e) {
      // Ignore Clarity errors
    }
  };

  return { track };
}

/**
 * Legacy Track event helper for Microsoft Clarity.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  const clarity = (window as any).clarity;
  if (typeof clarity === "function") {
    clarity("event", eventName, properties);
  }
}

// Legacy wrappers to preserve compatibility with other parts of the app
export const Analytics = {
  paperView: (subject: string, semester: number, paperId: string) =>
    trackEvent("paper_view", { subject, semester, paperId }),

  paperDownload: (paperId: string, subject: string) =>
    trackEvent("paper_download", { paperId, subject }),

  searchPerformed: (query: string, resultCount: number) =>
    trackEvent("search_performed", { query, resultCount }),

  browseFilterApplied: (filter: string, value: string) =>
    trackEvent("browse_filter_applied", { filter, value }),

  paperShared: (paperId: string, subject: string, method: string) =>
    trackEvent("paper_shared", { paperId, subject, method }),
};
