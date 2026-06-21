"use client";

import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown, X, Filter } from "lucide-react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { slugify } from "@/lib/utils";
import { Analytics, useAnalytics } from "@/lib/analytics";

import { SearchFilters, FILTER_OPTIONS, FilterKey } from "@/components/search-filters";

// Skeleton Loader for SearchParams Prerendering
function BrowseSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-pulse">
      {/* Title */}
      <div className="h-7 w-40 rounded bg-mist" />
      <div className="mt-2 h-4 w-60 rounded bg-mist/60" />

      {/* Search bar skeleton */}
      <div className="mt-6 h-13 w-full rounded-search bg-mist" />

      {/* Filters skeleton */}
      <div className="mt-4 flex gap-2">
        <div className="h-[38px] w-24 rounded-btn bg-mist" />
        <div className="h-[38px] w-28 rounded-btn bg-mist" />
        <div className="h-[38px] w-24 rounded-btn bg-mist" />
        <div className="h-[38px] w-20 rounded-btn bg-mist" />
      </div>

      {/* Count skeleton */}
      <div className="mt-8 border-b border-border pb-2.5">
        <div className="h-4 w-44 rounded bg-mist" />
      </div>

      {/* Grid skeleton */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-card border border-border bg-white p-4 h-[160px] flex flex-col justify-between"
          >
            <div>
              <div className="h-3 w-28 rounded bg-mist" />
              <div className="mt-3 h-5 w-44 rounded bg-mist" />
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-mist" />
              <div className="h-4 w-20 rounded bg-mist" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const { track } = useAnalytics();
  const lastLoggedRef = useRef<{ query: string; branch: string[]; semester: string[] } | null>(null);

  // State for search query and active filters
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedFilters, setSelectedFilters] = useState<Record<FilterKey, string[]>>({
    branch: [],
    semester: [],
    session: [],
    year: [],
  });



  // Derive active filters state
  const hasActiveFilters = Boolean(query) || Object.values(selectedFilters).some((f) => f.length > 0);

  // Helper to serialize and update URL
  const updateUrl = (q: string, filters: Record<FilterKey, string[]>) => {
    const params = new URLSearchParams();
    if (q.trim()) {
      params.set("q", q.trim());
    }
    (Object.keys(filters) as FilterKey[]).forEach((key) => {
      filters[key].forEach((val) => {
        params.append(key, key === "branch" ? slugify(val) : val);
      });
    });
    const searchStr = params.toString();
    router.replace(searchStr ? `/browse?${searchStr}` : "/browse", { scroll: false });
  };

  // Sync initial query and filters from URL search parameters
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setInputValue(q);

    const initialBranch = searchParams.getAll("branch")
      .map(s => FILTER_OPTIONS.branch.find(b => slugify(b) === s) || "")
      .filter(Boolean);
    const initialSemester = searchParams.getAll("semester");
    const initialSession = searchParams.getAll("session");
    const initialYear = searchParams.getAll("year");

    setSelectedFilters({
      branch: initialBranch,
      semester: initialSemester,
      session: initialSession,
      year: initialYear,
    });
  }, [searchParams]);

  // Live Query from Convex Database
  const branchSlugs = useMemo(() => selectedFilters.branch.map(slugify), [selectedFilters.branch]);
  const semesters = useMemo(() => selectedFilters.semester.map(Number), [selectedFilters.semester]);
  const sessions = selectedFilters.session;
  const years = useMemo(() => selectedFilters.year.map(Number), [selectedFilters.year]);

  const { results, status, loadMore } = usePaginatedQuery(
    api.papers.paginatedSearch,
    {
      query: query,
      branches: branchSlugs.length > 0 ? branchSlugs : undefined,
      semesters: semesters.length > 0 ? semesters : undefined,
      sessions: sessions.length > 0 ? sessions : undefined,
      years: years.length > 0 ? years : undefined,
    },
    { initialNumItems: 15 }
  );

  const papers = results ?? [];
  const isLoading = status === "LoadingFirstPage";

  const logSearch = useMutation(api.papers.logSearch);
  const parsed = useQuery(api.papers.parseQueryText, { query: query.trim() });

  // Debounced search logs analytics
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    const currentBranch = selectedFilters.branch;
    const currentSemester = selectedFilters.semester;

    // Check if this search with these filters has already been logged
    const isSameSearch = lastLoggedRef.current &&
      lastLoggedRef.current.query === trimmed &&
      JSON.stringify(lastLoggedRef.current.branch) === JSON.stringify(currentBranch) &&
      JSON.stringify(lastLoggedRef.current.semester) === JSON.stringify(currentSemester);

    if (isSameSearch) return;

    const delayDebounce = setTimeout(() => {
      logSearch({ query: trimmed });
      Analytics.searchPerformed(trimmed, papers.length);

      const branchDetected = parsed?.branches && parsed.branches.length > 0 ? parsed.branches[0] : "";
      const subjectDetected = parsed?.query || "";

      if (papers.length > 0) {
        track("search_performed", {
          query: trimmed,
          resultCount: papers.length,
          branchDetected,
          subjectDetected,
        });
      } else {
        track("search_no_results", {
          query: trimmed,
        });
      }

      lastLoggedRef.current = {
        query: trimmed,
        branch: [...currentBranch],
        semester: [...currentSemester]
      };
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [query, isLoading, papers.length, selectedFilters.branch, selectedFilters.semester, logSearch, track, parsed]);

  // Multi-select toggle handler
  const toggleFilterOption = (key: FilterKey, val: string) => {
    setSelectedFilters((prev) => {
      const current = prev[key];
      const next = current.includes(val)
        ? current.filter((x) => x !== val)
        : [...current, val];
      
      // Track Clarity analytics when a filter is applied (selected)
      if (!current.includes(val)) {
        Analytics.browseFilterApplied(key, val);
      }
      
      const nextFilters = { ...prev, [key]: next };
      updateUrl(query, nextFilters);
      return nextFilters;
    });
  };

  // Remove a single active filter chip
  const removeFilterChip = (key: FilterKey, val: string) => {
    setSelectedFilters((prev) => {
      const next = {
        ...prev,
        [key]: prev[key].filter((x) => x !== val),
      };
      updateUrl(query, next);
      return next;
    });
  };

  // Clear all active filters
  const clearAllFilters = () => {
    setSelectedFilters({
      branch: [],
      semester: [],
      session: [],
      year: [],
    });
    setQuery("");
    setInputValue("");
    router.replace("/browse");
  };



  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-fade-up">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tight text-navy-deep sm:text-3xl font-sans">
          Browse Papers
        </h1>
        <p className="mt-1.5 text-sm text-navy-mid/60">
          Find and filter previous year question papers instantly.
        </p>
      </div>

      {/* Spotlight Search Bar */}
      <div className="mt-6 relative w-full">
        <SearchAutocomplete
          value={inputValue}
          onChange={setInputValue}
          onSelect={(val) => {
            setQuery(val);
            updateUrl(val, selectedFilters);
          }}
          placeholder="Type to filter by subject, semester..."
          inputClassName="!h-13 !pl-12 !pr-4 !text-sm"
        />
      </div>

      {/* Filter Row */}
      {/* Filters Row */}
      <SearchFilters
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilterOption}
        onRemoveChip={removeFilterChip}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        className="mt-4"
      />

      {/* Result Count and Paper Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-mid/50">
            Available PYQ Papers ({isLoading ? "..." : papers.length})
          </span>
        </div>

        {/* Paper Grid */}
        {isLoading ? (
          /* Loading skeleton list */
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-card border border-border bg-white p-4 h-[160px] flex flex-col justify-between">
                <div>
                  <div className="h-3 w-28 bg-mist rounded" />
                  <div className="mt-3 h-5 w-44 bg-mist rounded" />
                </div>
                <div className="h-4 w-20 bg-mist rounded" />
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <a
                key={paper._id}
                href={`/paper/${paper._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between rounded-card border border-border bg-white p-4 transition-hover hover:translate-y-[-2px] hover:shadow-card cursor-pointer"
              >
                {/* Upper Metadata */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-mid/45">
                      Sem {paper.semester} · {paper.branch}
                    </span>
                    <span className="rounded bg-[#fef3e7] px-2 py-0.5 text-[10px] font-bold text-[#b45309] dark:bg-[#2a1a04] dark:text-[#d97706] shrink-0 font-mono">
                      PDF
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-semibold leading-tight text-navy-deep group-hover:text-sky-blue transition-colors">
                    {paper.subject}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {paper.keywords?.slice(0, 2).map((k: string) => (
                      <span
                        key={k}
                        className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-medium text-navy-mid/70 select-none"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer info inside Card */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-navy-mid/60">
                    {paper.session} {paper.year}
                  </span>
                  <span className="text-[12px] font-semibold text-sky-blue flex items-center gap-0.5 transition-hover group-hover:translate-x-0.5">
                    Open Paper →
                  </span>
                </div>
              </a>
            ))}
          </div>
          {status === "CanLoadMore" ? (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => loadMore(15)}
                className="rounded-btn border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy-deep shadow-sm transition-hover hover:border-sky-blue hover:text-sky-blue"
              >
                Load More Papers
              </button>
            </div>
          ) : null}
          {status === "LoadingMore" ? (
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-40 animate-pulse rounded bg-mist" />
            </div>
          ) : null}
        </>
        ) : (
          /* Empty State */
          <div className="mt-8 rounded-card border border-border bg-white py-16 text-center">
            <Filter className="mx-auto h-10 w-10 text-navy-mid/30" />
            <h3 className="mt-4 text-base font-semibold text-navy-deep">
              No question papers found
            </h3>
            <p className="mt-1.5 text-sm text-navy-mid/60">
              Try adjusting your active filters or query term to expand search.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 rounded-btn bg-navy-deep px-4 py-2 text-xs font-semibold text-white transition-hover hover:bg-navy-mid"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
