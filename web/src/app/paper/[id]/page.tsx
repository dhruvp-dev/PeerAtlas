"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Link2, Calendar, FileText, LayoutGrid, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id as any;
  const isValidId = typeof rawId === "string" && rawId.length === 32;
  const paperId = isValidId ? rawId : undefined;

  // live queries
  const queriedPaper = useQuery(api.papers.get, isValidId ? { id: paperId as any } : "skip");
  const paper = isValidId ? queriedPaper : null;
  const logPaperView = useMutation(api.papers.logPaperView);

  // States
  const [copied, setCopied] = useState(false);

  // Log view analytic trigger exactly once when component loads and paper is resolved
  useEffect(() => {
    if (paper) {
      logPaperView({ paperId: paperId as string });
      document.title = `${paper.subject} | PeerAtlas`;
    }
  }, [paper, paperId, logPaperView]);

  // Retrieve recommendations: papers of same branch and semester
  const relatedPapersQuery = useQuery(
    api.papers.search,
    paper
      ? {
          query: "",
          branches: [paper.branchSlug],
          semesters: [paper.semester],
        }
      : "skip" as any
  );

  const relatedPapers = (relatedPapersQuery ?? [])
    .filter((p) => p._id !== paperId)
    .slice(0, 3);

  // Copy shareable page link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (paper === undefined) {
    // Skeleton Loader
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 w-28 bg-mist rounded" />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          {/* Main content skeleton */}
          <div className="flex-1">
            <div className="h-8 w-80 bg-mist rounded" />
            <div className="mt-3 flex gap-2">
              <div className="h-4 w-20 bg-mist rounded" />
              <div className="h-4 w-28 bg-mist rounded" />
            </div>
            <div className="mt-6 h-[600px] w-full bg-mist rounded-card" />
          </div>

          {/* Sidebar skeleton */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="h-32 w-full bg-mist rounded-card" />
            <div className="mt-6 h-48 w-full bg-mist rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (paper === null) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-24 text-center">
        <h2 className="text-xl font-bold text-navy-deep">Question Paper Not Found</h2>
        <p className="mt-2 text-sm text-navy-mid/60">
          The requested exam paper does not exist or has been removed from the archive.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-flex rounded-btn bg-navy-deep px-5 py-2 text-xs font-semibold text-white transition-hover hover:bg-navy-mid"
        >
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-6 md:py-10 animate-fade-up">
      {/* Navigation Breadcrumb & Back action */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-mid/60 hover:text-sky-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <span className="hidden sm:inline text-xs font-bold text-navy-mid/45">
          Home &gt; Browse &gt; Semester {paper.semester} &gt; {paper.branchSlug.toUpperCase()}
        </span>
      </div>

      {/* Main Details Grid */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row items-start">
        {/* Main PDF Viewer */}
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded bg-sky-tint px-2 py-0.5 text-xs font-semibold text-navy-deep select-none">
                <FileText className="h-3 w-3" />
                Sem {paper.semester} · Previous Year Paper
              </span>
              <h1 className="mt-2.5 text-2xl font-bold text-navy-deep leading-tight">
                {paper.subject}
              </h1>
              <p className="mt-1 text-xs text-navy-mid/55">
                {paper.branch} · {paper.session} {paper.year}
              </p>
            </div>

            {/* Main Action Triggers */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className={`flex h-9 items-center gap-1.5 rounded-btn border border-border px-3.5 text-xs font-semibold select-none transition-hover cursor-pointer ${
                  copied
                    ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]"
                    : "bg-white text-navy-mid hover:border-sky-blue hover:text-navy-deep"
                }`}
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied Link!" : "Share Paper"}</span>
              </button>

              <a
                href={`/api/download?url=${encodeURIComponent(paper.fileUrl)}&filename=${encodeURIComponent(paper.subjectSlug + "_" + paper.year + ".pdf")}`}
                download={`${paper.subjectSlug}_${paper.year}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-btn bg-sky-blue px-3.5 text-xs font-semibold text-white transition-hover hover:bg-navy-deep shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          {/* Premium PDF Viewer Card */}
          <div className="mt-6 rounded-card border border-border bg-white p-2 shadow-sm overflow-hidden h-[720px]">
            <iframe
              src={`${paper.fileUrl}#toolbar=1&navpanes=0&statusbar=0`}
              className="w-full h-full rounded border-0 bg-mist/30"
              title={`${paper.subject} Question Paper PDF`}
            />
          </div>
        </div>

        {/* Info Sidebar & Recommendations */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
          {/* Metadata Card */}
          <div className="rounded-card border border-border bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-mid/45">
              Exam Details
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="h-4 w-4 text-navy-mid/35 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Branch
                  </div>
                  <div className="text-xs font-semibold text-navy-deep line-clamp-1">
                    {paper.branch}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-navy-mid/35 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Session & Year
                  </div>
                  <div className="text-xs font-semibold text-navy-deep">
                    {paper.session} {paper.year}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-navy-mid/35 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                    Page count
                  </div>
                  <div className="text-xs font-semibold text-navy-deep">
                    {paper.pageCount ? `${paper.pageCount} pages` : "Not scanned"}
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword tags */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-mid/45">
                  Extracted Keywords
                </span>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {paper.keywords.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-mist px-2 py-0.5 text-[10px] font-medium text-navy-mid/70 select-none"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Papers list */}
          <div className="rounded-card border border-border bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-mid/45">
              Related PYQ Papers
            </h3>

            {relatedPapers.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {relatedPapers.map((related) => (
                  <Link
                    key={related._id}
                    href={`/paper/${related._id}`}
                    className="group flex flex-col gap-1 rounded-lg border border-border/60 bg-white p-2.5 hover:border-sky-blue transition-hover cursor-pointer"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309] dark:text-[#d97706]">
                      {related.session} {related.year}
                    </span>
                    <h4 className="text-xs font-semibold text-navy-deep group-hover:text-sky-blue transition-colors line-clamp-2">
                      {related.subject}
                    </h4>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 py-4 text-center">
                <p className="text-xs text-navy-mid/60">No other papers available for this branch.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
