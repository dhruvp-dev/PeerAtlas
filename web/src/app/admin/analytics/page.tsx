"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, Search, Eye, FileText, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function Page() {
  // Convex queries
  const stats = useQuery(api.papers.getAdminStats);
  const topViewed = useQuery(api.papers.getTopViewed);
  const topSearches = useQuery(api.papers.getTopSearches);

  const isLoading = stats === undefined || topViewed === undefined || topSearches === undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-fade-up">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-mid/60 hover:text-sky-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <span className="text-xs font-bold text-navy-mid/45">Analytics Hub</span>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy-deep font-sans">
          System Analytics
        </h1>
        <p className="mt-1 text-xs text-navy-mid/60">
          Track visitor search behavior, catalog metrics, and popular exam paper views.
        </p>
      </div>

      {isLoading ? (
        <div className="mx-auto flex h-[350px] flex-col items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-sky-blue" />
          <span className="mt-2 text-xs font-semibold text-navy-mid/50">Aggregating analytics data...</span>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-border bg-white p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Total Catalog Papers
                </span>
                <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                  {stats.totalPapers}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-tint text-sky-blue select-none">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Accumulated Paper Views
                </span>
                <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                  {stats.totalViews}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fef3e7] text-[#b45309] select-none">
                <Eye className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Logged Search Queries
                </span>
                <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                  {stats.totalSearches}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecfdf5] text-[#047857] select-none">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Top Searched Queries with Progress bars */}
            <div className="rounded-card border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BarChart3 className="h-4.5 w-4.5 text-navy-mid/40" />
                <h3 className="text-sm font-bold text-navy-deep">Top Search Terms</h3>
              </div>

              {topSearches.length > 0 ? (
                <div className="mt-4 flex flex-col gap-4">
                  {topSearches.map((item, idx) => {
                    const maxVal = topSearches[0].count || 1;
                    const percent = Math.round((item.count / maxVal) * 100);

                    return (
                      <div key={item.query}>
                        <div className="flex items-center justify-between text-xs font-semibold text-navy-deep">
                          <span className="truncate max-w-[200px]">
                            {idx + 1}. "{item.query}"
                          </span>
                          <span className="font-mono text-navy-mid/70">{item.count} searches</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-mist overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full rounded-full bg-sky-blue transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">
                  No search logs recorded yet.
                </div>
              )}
            </div>

            {/* Top Viewed Papers */}
            <div className="rounded-card border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Sparkles className="h-4.5 w-4.5 text-[#b45309]" />
                <h3 className="text-sm font-bold text-navy-deep">Most Popular Papers</h3>
              </div>

              {topViewed.length > 0 ? (
                <div className="mt-4 flex flex-col gap-3">
                  {topViewed.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/40 p-2.5 hover:border-sky-blue transition-hover"
                    >
                      <div className="truncate max-w-[220px]">
                        <h4 className="text-xs font-semibold text-navy-deep truncate">
                          {idx + 1}. {item.subject}
                        </h4>
                        <span className="text-[10px] text-navy-mid/55 uppercase font-bold">
                          Sem {item.semester} · {item.session ?? ""} {item.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 bg-sky-tint px-2 py-0.5 rounded text-[11px] font-bold text-navy-deep font-mono">
                        <Eye className="h-3 w-3 text-sky-blue" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">
                  No page views recorded yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
