import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { MOCK_PAPERS } from "@/lib/mock-data";
import { HeroClient } from "@/components/hero-client";

export default async function Page() {
  let livePapers;
  try {
    livePapers = await fetchQuery(api.papers.search, { query: "" });
  } catch (e) {
    console.error("Failed to fetch papers from Convex", e);
    livePapers = null;
  }

  const papers = livePapers ? livePapers.slice(0, 4) : MOCK_PAPERS.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-8 md:py-12 animate-fade-up">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy-deep sm:text-4.5xl md:text-5xl lg:text-[40px] leading-tight font-sans">
          The fastest way to find exam papers.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-navy-mid/65 md:text-base">
          Stop scrolling through messy folders, chats, and drives. Get direct access to the paper you need in 5 seconds.
        </p>
      </div>

      {/* Spotlight Search Bar */}
      <HeroClient />

      {/* Popular Papers preview list */}
      <div className="mt-10 md:mt-12">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-mid/50">
            Frequently Accessed Papers
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
          {papers.map((paper: any) => (
            <Link
              key={paper._id}
              href={`/paper/${paper._id}`}
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
