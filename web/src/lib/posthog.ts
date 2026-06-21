import posthog from "posthog-js";
import { usePostHog } from "posthog-js/react";

export interface PostHogEvents {
  paper_viewed: {
    paperId: string;
    paperTitle: string;
    branch: string;
    semester: number;
    subject: string;
    examYear: number;
    examType: string;
  };
  paper_downloaded: {
    paperId: string;
    paperTitle: string;
    branch: string;
    semester: number;
    subject: string;
    examYear: number;
    fileSize: number;
  };
  search_performed: {
    query: string;
    resultCount: number;
    branchDetected: string;
    subjectDetected: string;
  };
  search_no_results: {
    query: string;
  };
  related_paper_clicked: {
    sourcePaperId: string;
    destinationPaperId: string;
    sourceSubject: string;
    destinationSubject: string;
  };
  paper_shared: {
    paperId: string;
    subject: string;
    branch: string;
    shareMethod: string;
  };
  external_link_clicked: {
    destination: "github" | "portfolio" | "feedback_form";
  };
  feedback_submitted: {
    category: string;
    rating: number;
    comment?: string;
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
