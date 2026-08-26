"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { TIMETABLE_BANNER_EXPIRY } from "@/lib/timetable-config";

export function TimetableBanner() {
  const [isExpired, setIsExpired] = useState(() => {
    if (typeof window === "undefined") {
      // Server-side check
      return new Date() >= new Date(TIMETABLE_BANNER_EXPIRY);
    }
    // Client-side initial state check
    return new Date() >= new Date(TIMETABLE_BANNER_EXPIRY);
  });

  useEffect(() => {
    const expired = new Date() >= new Date(TIMETABLE_BANNER_EXPIRY);
    setIsExpired(expired);
  }, []);

  if (isExpired) {
    return null;
  }

  return (
    <div className="w-full mt-6 md:mt-8">
      <Link
        href="/timetable"
        aria-label="New timetable released — View Winter 2026 theory timetable"
        className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-card border border-border bg-white dark:bg-card p-4 sm:px-5 sm:py-4 shadow-sm transition-all duration-200 hover:border-sky-blue/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-tint text-sky-blue dark:bg-sky-blue/10">
            <Calendar className="h-5 w-5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded bg-sky-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-deep dark:bg-sky-blue/20 dark:text-sky-blue select-none">
                New Timetable Released
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-navy-deep dark:text-foreground line-clamp-1">
              The latest Winter 2026 theory timetable is now available.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-btn bg-sky-blue px-3.5 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-navy-deep dark:group-hover:bg-sky-blue/80 shadow-sm">
          <span>View Timetable</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </div>
  );
}
