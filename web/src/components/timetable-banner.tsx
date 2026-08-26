"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { TIMETABLE_BANNER_EXPIRY } from "@/lib/timetable-config";

export function TimetableBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [isExpired, setIsExpired] = useState(() => {
    return new Date() >= new Date(TIMETABLE_BANNER_EXPIRY);
  });

  useEffect(() => {
    const expired = new Date() >= new Date(TIMETABLE_BANNER_EXPIRY);
    setIsExpired(expired);
  }, []);

  // Hide if expired, dismissed, or currently on the timetable page itself
  if (isExpired || dismissed || pathname === "/timetable") {
    return null;
  }

  return (
    <div className="w-full bg-navy-deep text-white dark:bg-card dark:border-b dark:border-border transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2 text-xs font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 rounded bg-sky-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white select-none">
            New Timetable
          </span>
          <span className="truncate text-white/90 font-sans">
            The latest Winter 2026 theory timetable is now available!
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/timetable"
            className="inline-flex items-center gap-1 font-semibold text-sky-blue hover:text-white dark:hover:text-sky-blue transition-colors underline underline-offset-2"
          >
            <span>View Timetable</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded p-0.5 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss timetable announcement banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
