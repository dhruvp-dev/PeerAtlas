"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, ArrowRight, BookOpen, Layers, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "peeratlas_new_papers_2026_seen_v1";

export function NewPapersModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage only on client mount
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Small delay so page loads smoothly before modal surfaces
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  const handleExplore = () => {
    handleDismiss();
    router.push("/browse?year=2026");
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-papers-modal-title"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-7 dark:bg-card text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-1.5 text-navy-mid/60 hover:bg-mist hover:text-navy-deep transition-colors dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
          aria-label="Close announcement modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge & Header */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-tint px-3 py-1 text-xs font-semibold text-sky-blue dark:bg-sky-500/10 dark:text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
            New Archive Release
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Summer 2026
          </span>
        </div>

        <h2
          id="new-papers-modal-title"
          className="mt-3.5 text-xl font-bold tracking-tight text-navy-deep sm:text-2xl font-sans dark:text-white"
        >
          Summer 2026 Question Papers Are Now Live!
        </h2>

        <p className="mt-2 text-sm text-navy-mid/70 leading-relaxed dark:text-muted-foreground">
          We’ve just uploaded <strong className="text-navy-deep font-semibold dark:text-foreground">660+ newly digitized question papers</strong> from the 2026 Bharati Vidyapeeth (BVDU) examinations to PeerAtlas.
        </p>

        {/* Feature Highlights Grid */}
        <div className="mt-4.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-mist/50 p-3 dark:bg-muted/40">
            <div className="flex items-center gap-1.5 text-sky-blue dark:text-sky-400">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-bold">664 Papers</span>
            </div>
            <p className="mt-1 text-[11.5px] text-navy-mid/65 dark:text-muted-foreground">
              Summer 2026 examination papers
            </p>
          </div>

          <div className="rounded-xl border border-border bg-mist/50 p-3 dark:bg-muted/40">
            <div className="flex items-center gap-1.5 text-sky-blue dark:text-sky-400">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-bold">8 Semesters</span>
            </div>
            <p className="mt-1 text-[11.5px] text-navy-mid/65 dark:text-muted-foreground">
              Semesters 1 through 8 included
            </p>
          </div>

          <div className="rounded-xl border border-border bg-mist/50 p-3 dark:bg-muted/40">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold">All Branches</span>
            </div>
            <p className="mt-1 text-[11.5px] text-navy-mid/65 dark:text-muted-foreground">
              CS, AIML, IT, E&TC, Civil & more
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-btn border border-border bg-transparent px-4 py-2.5 text-xs font-semibold text-navy-mid hover:bg-mist hover:text-navy-deep transition-colors dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground text-center"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleExplore}
            className="flex items-center justify-center gap-1.5 rounded-btn bg-navy-deep px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-mid transition-all dark:bg-sky-blue dark:hover:bg-sky-600"
          >
            <span>Explore 2026 Papers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
