"use client";

import { ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Initialize PostHog client-side
if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  
  if (key) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: false, // Handled manually below to support SPA routing in App Router correctly
      loaded: (posthogInstance) => {
        if (process.env.NODE_ENV === "development") {
          posthogInstance.debug(); // Enable debug mode in development
        }
      },
      // Include the defaults configuration provided by the user
      ...({ defaults: "2026-05-30" } as any),
    });
  }
}

export function PHProvider({ children }: { children: ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  
  // Gracefully fallback if the environment variable is not defined
  if (!key) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (key) {
        posthog.capture("$pageview", { $current_url: url });
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export function SuspendedPostHogPageView() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
