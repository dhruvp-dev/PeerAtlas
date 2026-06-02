import posthog from "posthog-js";
import { usePostHog } from "posthog-js/react";

export interface PostHogEvents {
  paper_viewed: {
    paper_id: string;
    paper_name: string;
    subject: string;
    semester: number;
    year: number;
    branch: string;
  };
  paper_downloaded: {
    paper_id: string;
    paper_name: string;
    subject: string;
    semester: number;
    year: number;
    branch: string;
  };
  search_performed: {
    search_query: string;
    branch?: string[];
    semester?: string[];
  };
  search_no_results: {
    search_query: string;
    branch?: string[];
    semester?: string[];
  };
}

/**
 * Track a PostHog event from anywhere on the client.
 * Safe to call even if PostHog is not initialized or during SSR.
 */
export function trackPostHogEvent<T extends keyof PostHogEvents>(
  eventName: T,
  properties: PostHogEvents[T]
): void {
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error("Failed to capture PostHog event:", error);
  }
}

/**
 * React hook to track PostHog events with full TypeScript type safety.
 */
export function usePostHogAnalytics() {
  const phClient = usePostHog();
  
  const track = <T extends keyof PostHogEvents>(
    eventName: T,
    properties: PostHogEvents[T]
  ) => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    try {
      if (phClient) {
        phClient.capture(eventName, properties);
      } else {
        // Fallback to global instance if context is not ready
        posthog.capture(eventName, properties);
      }
    } catch (error) {
      console.error("Failed to capture PostHog event via hook:", error);
    }
  };

  return { trackEvent: track };
}
