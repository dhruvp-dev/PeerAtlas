"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, FileText, Layers, GraduationCap } from "lucide-react";

const STORAGE_KEY = "peeratlas_new_papers_2026_seen_v4";

export function NewPapersModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 300);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-papers-modal-title"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xl transition-all text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3.5 top-3.5 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Subtle Category Tag */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            Archive Update
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Summer 2026
          </span>
        </div>

        {/* Title & Description */}
        <h2
          id="new-papers-modal-title"
          className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans leading-snug"
        >
          Summer 2026 Question Papers Now Available
        </h2>

        <p className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
          664 newly digitized previous year question papers from the 2026 examinations have been verified and added to the library.
        </p>

        {/* Minimalist 3-Metric Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-sm font-bold text-foreground">664</span>
            </div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground font-medium">Papers</div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="text-sm font-bold text-foreground">1 – 8</span>
            </div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground font-medium">Semesters</div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span className="text-sm font-bold text-foreground">8+</span>
            </div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground font-medium">Branches</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg border border-border bg-transparent px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleExplore}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 text-[#ffffff] px-4 py-2 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span className="text-[#ffffff]">Browse 2026 Papers</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#ffffff]" />
          </button>
        </div>
      </div>
    </div>
  );
}
