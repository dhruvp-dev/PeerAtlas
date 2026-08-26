"use client";

import Link from "next/link";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { TIMETABLE_PDF_PATH } from "@/lib/timetable-config";

export default function TimetableClient() {
  const downloadUrl = TIMETABLE_PDF_PATH.startsWith("http")
    ? `/api/download?url=${encodeURIComponent(TIMETABLE_PDF_PATH)}&filename=College_of_Engineering_Theory_Timetable_Winter_2026.pdf`
    : TIMETABLE_PDF_PATH;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-6 md:py-10 animate-fade-up">
      {/* Navigation Breadcrumb & Back action */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-mid/60 hover:text-sky-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <span className="hidden sm:inline text-xs font-bold text-navy-mid/45">
          Home &gt; Winter 2026 Timetable
        </span>
      </div>

      {/* Main Details Header */}
      <div className="mt-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 rounded bg-sky-tint px-2 py-0.5 text-xs font-semibold text-navy-deep dark:bg-sky-blue/20 dark:text-sky-blue select-none">
            <Calendar className="h-3 w-3" />
            Winter 2026 · College Timetable
          </span>
          <h1 className="mt-2.5 text-2xl font-bold text-navy-deep dark:text-foreground leading-tight">
            College of Engineering - Pune Navi Mumbai Campus
          </h1>
          <p className="mt-1 text-xs text-navy-mid/65 dark:text-muted-foreground">
            Theory Timetable Winter - 2026
          </p>
        </div>

        {/* Main Action Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={downloadUrl}
            download="College_of_Engineering_Theory_Timetable_Winter_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-btn bg-sky-blue px-3.5 text-xs font-semibold text-white transition-hover hover:bg-navy-deep dark:hover:bg-sky-blue/80 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Main PDF Viewer Card */}
      <div className="mt-6 rounded-card border border-border bg-white dark:bg-card p-2 shadow-sm overflow-hidden h-[720px] md:h-[800px]">
        <iframe
          src={`${TIMETABLE_PDF_PATH}#toolbar=1&navpanes=0&statusbar=0`}
          className="w-full h-full rounded border-0 bg-mist/30 dark:bg-background"
          title="College of Engineering Theory Timetable Winter 2026 PDF"
        />
      </div>
    </div>
  );
}
