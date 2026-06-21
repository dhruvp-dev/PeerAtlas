"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  UserCheck,
  HeartHandshake,
  TrendingUp,
  Eye,
  FileText,
  Search,
  Share2,
  Star,
  MessageSquare,
  ArrowDownToLine,
  Globe,
  Award
} from "lucide-react";

// Custom SVG Icons to avoid lucide-react version mismatch issues
const Github = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    width="20"
    height="20"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);



import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Tab = "academic" | "product" | "founder" | "exam";

export default function AnalyticsHub() {
  const [activeTab, setActiveTab] = useState<Tab>("academic");

  // Call the consolidated analytics stats query
  const stats = useQuery(api.analytics.getDashboardStats);

  const isLoading = stats === undefined;

  // Format date helper (looks like 'Jun 22, 2026')
  const formatDateString = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-fade-up font-sans">
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

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-deep font-sans">
            Product Analytics
          </h1>
          <p className="mt-1 text-xs text-navy-mid/60">
            Real-time insights on search queries, file downloads, user retention, and feedback.
          </p>
        </div>

        {/* Tab switcher pills */}
        <div className="flex items-center gap-1.5 rounded-btn bg-mist p-1 dark:bg-zinc-900 border border-border/55">
          <button
            onClick={() => setActiveTab("academic")}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "academic"
                ? "bg-white text-navy-deep shadow-sm dark:bg-zinc-850 dark:text-white"
                : "text-navy-mid/60 hover:text-navy-deep hover:bg-white/40 dark:hover:bg-zinc-800/40"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Academic</span>
          </button>
          <button
            onClick={() => setActiveTab("product")}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "product"
                ? "bg-white text-navy-deep shadow-sm dark:bg-zinc-850 dark:text-white"
                : "text-navy-mid/60 hover:text-navy-deep hover:bg-white/40 dark:hover:bg-zinc-800/40"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Product</span>
          </button>
          <button
            onClick={() => setActiveTab("founder")}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "founder"
                ? "bg-white text-navy-deep shadow-sm dark:bg-zinc-850 dark:text-white"
                : "text-navy-mid/60 hover:text-navy-deep hover:bg-white/40 dark:hover:bg-zinc-800/40"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Founder</span>
          </button>
          <button
            onClick={() => setActiveTab("exam")}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "exam"
                ? "bg-white text-navy-deep shadow-sm dark:bg-zinc-850 dark:text-white"
                : "text-navy-mid/60 hover:text-navy-deep hover:bg-white/40 dark:hover:bg-zinc-800/40"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Exam Insights</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mx-auto flex h-[400px] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-blue" />
          <span className="mt-3 text-xs font-bold text-navy-mid/50">Aggregating analytics dashboards...</span>
        </div>
      ) : (
        <div className="mt-8">
          {/* ========================================================================= */}
          {/* ACADEMIC DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "academic" && (
            <div className="space-y-6 animate-fade-up">
              {/* Academic Overview Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Total Subject Offerings
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-navy-deep font-mono">
                      {stats.academic.topSubjects.length}
                    </h3>
                    <span className="text-xs text-navy-mid/50 font-semibold">Active in views</span>
                  </div>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Most Active Branch
                  </span>
                  <h3 className="mt-1 text-base font-bold text-navy-deep truncate">
                    {stats.academic.topBranches[0]?.name || "None"}
                  </h3>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Peak Semester Activity
                  </span>
                  <h3 className="mt-1 text-base font-bold text-navy-deep">
                    {stats.academic.topSemesters[0]
                      ? `Semester ${stats.academic.topSemesters[0].semester}`
                      : "None"}
                  </h3>
                </div>
              </div>

              {/* Lists and Progress bars */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Branches */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Award className="h-4.5 w-4.5 text-navy-mid/40" />
                    <h3 className="text-sm font-bold text-navy-deep">Top Branches</h3>
                  </div>
                  {stats.academic.topBranches.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-4">
                      {stats.academic.topBranches.map((item, idx) => {
                        const maxVal = stats.academic.topBranches[0].count || 1;
                        const percent = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.name}>
                            <div className="flex items-center justify-between text-xs font-semibold text-navy-deep">
                              <span className="truncate max-w-[200px]">{idx + 1}. {item.name}</span>
                              <span className="font-mono text-navy-mid/70">{item.count} views</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-mist dark:bg-zinc-900 overflow-hidden">
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
                    <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">No activity recorded.</div>
                  )}
                </div>

                {/* Top Search Terms */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Search className="h-4.5 w-4.5 text-navy-mid/40" />
                    <h3 className="text-sm font-bold text-navy-deep">Most Searched Terms</h3>
                  </div>
                  {stats.academic.mostSearched.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-4">
                      {stats.academic.mostSearched.map((item, idx) => {
                        const maxVal = stats.academic.mostSearched[0].count || 1;
                        const percent = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.query}>
                            <div className="flex items-center justify-between text-xs font-semibold text-navy-deep">
                              <span className="truncate max-w-[200px]">{idx + 1}. "{item.query}"</span>
                              <span className="font-mono text-navy-mid/70">{item.count} searches</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-mist dark:bg-zinc-900 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-full rounded-full bg-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">No search logs yet.</div>
                  )}
                </div>

                {/* Most Viewed Papers */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Eye className="h-4.5 w-4.5 text-amber-500" />
                    <h3 className="text-sm font-bold text-navy-deep">Most Viewed Papers</h3>
                  </div>
                  {stats.academic.mostViewed.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {stats.academic.mostViewed.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-1.5 border-b border-border/40 last:border-b-0 text-xs">
                          <span className="font-semibold text-navy-deep truncate max-w-[240px]">
                            {idx + 1}. {item.title}
                          </span>
                          <span className="font-mono bg-sky-tint text-navy-deep px-2 py-0.5 rounded text-[11px] font-bold">
                            {item.count} views
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">No views yet.</div>
                  )}
                </div>

                {/* Most Downloaded Papers */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <ArrowDownToLine className="h-4.5 w-4.5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-navy-deep">Most Downloaded Papers</h3>
                  </div>
                  {stats.academic.mostDownloaded.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {stats.academic.mostDownloaded.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-1.5 border-b border-border/40 last:border-b-0 text-xs">
                          <span className="font-semibold text-navy-deep truncate max-w-[240px]">
                            {idx + 1}. {item.title}
                          </span>
                          <span className="font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 px-2 py-0.5 rounded text-[11px] font-bold">
                            {item.count} downloads
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">No downloads yet.</div>
                  )}
                </div>

                {/* Most Shared Papers */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Share2 className="h-4.5 w-4.5 text-[#b45309]" />
                    <h3 className="text-sm font-bold text-navy-deep">Most Shared Papers (Copy-Link)</h3>
                  </div>
                  {stats.academic.mostShared.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {stats.academic.mostShared.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border border-border/60 text-xs">
                          <span className="font-semibold text-navy-deep truncate max-w-[200px]">
                            {idx + 1}. {item.title}
                          </span>
                          <span className="font-mono bg-[#fef3e7] text-[#b45309] px-2 py-0.5 rounded text-[11px] font-bold">
                            {item.count} shares
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 py-12 text-center text-xs text-navy-mid/50 md:col-span-2">No shares recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRODUCT DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "product" && (
            <div className="space-y-6 animate-fade-up">
              {/* Product Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Daily Active Users (DAU)
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                    {stats.product.dau}
                  </h3>
                  <p className="mt-1 text-[10px] text-navy-mid/60">Unique visitors in past 24 hours</p>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Weekly Active Users (WAU)
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                    {stats.product.wau}
                  </h3>
                  <p className="mt-1 text-[10px] text-navy-mid/60">Unique visitors in past 7 days</p>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Returning Visitors
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                    {stats.product.returningVisitors}
                  </h3>
                  <p className="mt-1 text-[10px] text-navy-mid/60">Users with multiple logged sessions</p>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Searches Per User
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                    {stats.product.searchesPerUser}
                  </h3>
                  <p className="mt-1 text-[10px] text-navy-mid/60">Average searches per active searcher</p>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Downloads Per User
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                    {stats.product.downloadsPerUser}
                  </h3>
                  <p className="mt-1 text-[10px] text-navy-mid/60">Average downloads per downloading user</p>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Session Bounce Rate
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-navy-deep font-mono">
                    {stats.product.bounceRate}%
                  </h3>
                  <p className="mt-1 text-[10px] text-navy-mid/60">Sessions with exactly one recorded event</p>
                </div>
              </div>

              {/* Active Users Timeline chart list */}
              <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <UserCheck className="h-4.5 w-4.5 text-navy-mid/40" />
                  <h3 className="text-sm font-bold text-navy-deep">Daily Active Users Timeline (Last 7 Days)</h3>
                </div>
                {stats.product.dailyActiveCounts.length > 0 ? (
                  <div className="mt-6 flex flex-col gap-4">
                    {stats.product.dailyActiveCounts.map((day) => {
                      const maxVal = Math.max(...stats.product.dailyActiveCounts.map(d => d.count), 1);
                      const percent = Math.round((day.count / maxVal) * 100);
                      return (
                        <div key={day.date} className="flex items-center gap-4 text-xs font-semibold">
                          <span className="w-24 shrink-0 font-mono text-navy-mid/70">{day.date}</span>
                          <div className="h-5 flex-1 rounded-sm bg-mist dark:bg-zinc-900 overflow-hidden relative flex items-center px-2">
                            <div
                              style={{ width: `${percent}%` }}
                              className="absolute left-0 top-0 bottom-0 bg-sky-blue/30 border-r border-sky-blue"
                            />
                            <span className="relative z-10 font-mono text-[10px] text-navy-deep">{day.count} active users</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-8 py-12 text-center text-xs text-navy-mid/50">No temporal data available.</div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOUNDER DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "founder" && (
            <div className="space-y-6 animate-fade-up">
              {/* CTR Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    GitHub Clicks
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-navy-deep font-mono">
                      {stats.founder.gitHubClicks}
                    </h3>
                    <Github className="h-5 w-5 text-navy-mid/60" />
                  </div>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Portfolio Clicks
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-navy-deep font-mono">
                      {stats.founder.portfolioClicks}
                    </h3>
                    <Globe className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>

                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Feedback Submissions
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-navy-deep font-mono">
                      {stats.founder.feedbackSubmissions}
                    </h3>
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Traffic sources */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Globe className="h-4.5 w-4.5 text-navy-mid/40" />
                    <h3 className="text-sm font-bold text-navy-deep">Traffic Referrals</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    {stats.founder.trafficSources.length > 0 ? (
                      stats.founder.trafficSources.map((item) => (
                        <div key={item.source} className="flex items-center justify-between text-xs font-semibold">
                          <span className="truncate max-w-[150px] text-navy-deep">{item.source}</span>
                          <span className="font-mono bg-sky-tint px-2 py-0.5 rounded text-[10px] font-bold text-navy-deep">
                            {item.count} clicks
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-navy-mid/50">No referrer data tracked yet.</div>
                    )}
                  </div>
                </div>

                {/* Feedback Comment List */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm md:col-span-2 flex flex-col">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Star className="h-4.5 w-4.5 text-amber-500" />
                    <h3 className="text-sm font-bold text-navy-deep">User Feedbacks</h3>
                  </div>
                  <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar flex-1">
                    {stats.founder.feedbacks.length > 0 ? (
                      stats.founder.feedbacks.map((f) => (
                        <div key={f.id} className="p-3 rounded-lg border border-border bg-mist/20 dark:bg-zinc-900/10 flex flex-col gap-2">
                          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-navy-deep px-2 py-0.5 bg-sky-tint rounded-sm text-[10px] uppercase">
                                {f.category}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3.5 w-3.5 ${
                                      s <= f.rating ? "fill-amber-400 stroke-amber-500" : "stroke-navy-mid/20"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-navy-mid/50">
                              {formatDateString(f.timestamp)}
                            </span>
                          </div>
                          {f.comment ? (
                            <p className="text-[12px] text-navy-mid leading-relaxed italic bg-white dark:bg-zinc-950 p-2 rounded border border-border/50">
                              "{f.comment}"
                            </p>
                          ) : (
                            <span className="text-[10px] text-navy-mid/45 italic">No comment provided.</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-navy-mid/50">No feedback submitted yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EXAM INSIGHTS */}
          {/* ========================================================================= */}
          {activeTab === "exam" && (
            <div className="space-y-6 animate-fade-up">
              {/* Exam Trends overview */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Trending Subjects This Week */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <TrendingUp className="h-4.5 w-4.5 text-navy-mid/40" />
                    <h3 className="text-sm font-bold text-navy-deep">Trending Subjects (This Week)</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    {stats.examInsights.trendingSubjects.length > 0 ? (
                      stats.examInsights.trendingSubjects.map((item, idx) => {
                        const maxVal = stats.examInsights.trendingSubjects[0].count || 1;
                        const percent = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.name}>
                            <div className="flex items-center justify-between text-xs font-semibold text-navy-deep">
                              <span className="truncate max-w-[200px]">{idx + 1}. {item.name}</span>
                              <span className="font-mono text-navy-mid/70">{item.count} activity score</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-mist dark:bg-zinc-900 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-full rounded-full bg-indigo-500 transition-all"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-navy-mid/50">No trends yet.</div>
                    )}
                  </div>
                </div>

                {/* Trending Papers This Week */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Award className="h-4.5 w-4.5 text-navy-mid/40" />
                    <h3 className="text-sm font-bold text-navy-deep">Trending Papers (This Week)</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {stats.examInsights.trendingPapers.length > 0 ? (
                      stats.examInsights.trendingPapers.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-1.5 border-b border-border/40 last:border-b-0 text-xs">
                          <span className="font-semibold text-navy-deep truncate max-w-[200px]">
                            {idx + 1}. {item.title}
                          </span>
                          <span className="font-mono bg-sky-tint text-navy-deep px-2 py-0.5 rounded text-[11px] font-bold">
                            {item.count} activity score
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-navy-mid/50">No papers trending this week.</div>
                    )}
                  </div>
                </div>

                {/* Download spikes */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <ArrowDownToLine className="h-4.5 w-4.5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-navy-deep">Download Activity Spikes</h3>
                  </div>
                  {stats.examInsights.downloadSpikes.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {stats.examInsights.downloadSpikes.map((spike) => (
                        <div key={spike.date} className="flex items-center justify-between text-xs font-semibold">
                          <span className="font-mono text-navy-mid/70">{spike.date}</span>
                          <span className="font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            {spike.count} downloads
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-navy-mid/50">No recent downloads.</div>
                  )}
                </div>

                {/* Branch-wise Activity */}
                <div className="rounded-card border border-border bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <BookOpen className="h-4.5 w-4.5 text-navy-mid/40" />
                    <h3 className="text-sm font-bold text-navy-deep">Branch Activity Score (This Week)</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    {stats.examInsights.branchActivity.length > 0 ? (
                      stats.examInsights.branchActivity.map((item, idx) => {
                        const maxVal = stats.examInsights.branchActivity[0].count || 1;
                        const percent = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.branch}>
                            <div className="flex items-center justify-between text-xs font-semibold text-navy-deep">
                              <span className="truncate max-w-[200px]">{idx + 1}. {item.branch}</span>
                              <span className="font-mono text-navy-mid/70">{item.count} activity</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-mist dark:bg-zinc-900 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-full rounded-full bg-sky-blue transition-all"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-navy-mid/50">No branch activity recorded.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
