"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, FileText, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MOCK_PAPERS } from "@/lib/mock-data";

export default function Page() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const livePapers = useQuery(api.papers.search, { query: "" });
  const papers = livePapers ? livePapers.slice(0, 4) : MOCK_PAPERS.slice(0, 4);

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  const handleSuggestionClick = (val: string) => {
    router.push(`/browse?q=${encodeURIComponent(val)}`);
  };

  const suggestions = ["Machine Learning", "DBMS", "AIML", "Semester 5", "Winter 2024"];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 py-12 md:py-20 animate-fade-up">
      {/* Hero Section */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-tint px-3 py-1 text-xs font-semibold text-sky-blue select-none">
          ✨ Academic Archive
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-deep sm:text-4.5xl md:text-5xl lg:text-[40px] leading-tight font-sans">
          The fastest way to find exam papers.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-navy-mid/65 md:text-base">
          Stop scrolling through messy folders, chats, and drives. Get direct access to the paper you need in 5 seconds.
        </p>
      </div>

      {/* Spotlight Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mt-8 md:mt-10 relative w-full">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <Search className="absolute left-4 h-5 w-5 text-navy-mid/35 pointer-events-none" />

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search subject, branch, sem, year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 w-full rounded-search border border-border bg-white pl-12 pr-[64px] text-[15px] font-medium text-navy-deep placeholder:text-navy-mid/35 transition-hover focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15"
          />

          {/* ⌘K / Ctrl+K Badge */}
          <div className="absolute right-4 flex items-center gap-0.5 rounded-md border border-border bg-mist px-2 py-0.5 text-[11px] font-semibold text-navy-mid/50 select-none">
            <span className="text-[10px]">⌘</span>K
          </div>
        </div>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs text-navy-mid/60 md:text-sm">
        <span className="font-semibold text-navy-mid/45">Try searching:</span>
        {suggestions.map((sug, idx) => (
          <div key={sug} className="flex items-center">
            {idx > 0 && <span className="mr-2 text-navy-mid/30 select-none">·</span>}
            <button
              onClick={() => handleSuggestionClick(sug)}
              className="font-medium text-navy-mid/70 transition-colors hover:text-sky-blue hover:underline"
            >
              {sug}
            </button>
          </div>
        ))}
      </div>

      {/* Popular Papers preview list */}
      <div className="mt-14 md:mt-18">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-mid/50">
            Popular papers during exams
          </h2>
          <Link
            href="/browse"
            className="flex items-center gap-1 text-[13px] font-semibold text-sky-blue transition-colors hover:text-navy-deep group"
          >
            Browse all
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* List-style preview rows (GitHub file browser style) */}
        <div className="mt-3 divide-y divide-border border-b border-border">
          {papers.map((paper) => (
            <div
              key={paper._id}
              onClick={() => router.push(`/paper/${paper._id}`)}
              className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-row px-3.5 py-3 transition-hover hover:bg-mist cursor-pointer"
            >
              {/* Content */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-sky-blue/70" />
                  <span className="text-[14.5px] font-semibold tracking-tight text-navy-deep truncate">
                    {paper.subject}
                  </span>
                  <span className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-mid/60 font-mono shrink-0">
                    SEM {paper.semester}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-navy-mid/65">
                  <span className="truncate">{paper.branch}</span>
                  <span>·</span>
                  <span className="shrink-0">{paper.session} {paper.year}</span>
                </div>
              </div>

              {/* PDF Badge */}
              <div className="shrink-0 flex items-center justify-center rounded bg-[#fef3e7] px-2.5 py-1 text-[11px] font-bold text-[#b45309]">
                PDF
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
