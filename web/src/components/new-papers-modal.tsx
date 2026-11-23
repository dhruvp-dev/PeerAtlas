"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  ArrowRight,
  FileText,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "peeratlas_new_papers_2026_seen_v2";

export function NewPapersModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore if localStorage is unavailable
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-papers-modal-title"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-7 dark:bg-[#131417] text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-400/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4.5 top-4.5 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close announcement modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header & Release Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 shadow-sm shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              Summer 2026 Archive
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Live Now
            </span>
          </div>
        </div>

        {/* Main Title & Description */}
        <h2
          id="new-papers-modal-title"
          className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans leading-snug"
        >
          Summer 2026 Question Papers Are Here!
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We’ve just uploaded <strong className="font-semibold text-foreground">660+ freshly digitized exam question papers</strong> to the PeerAtlas library with verified OCR and instant PDF access.
        </p>

        {/* Sleek Stats Card Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/50 dark:bg-muted/30 p-3 transition-colors hover:border-sky-500/30">
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">664</span>
              <FileText className="h-4 w-4 text-sky-500" />
            </div>
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">New Papers</span>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/50 dark:bg-muted/30 p-3 transition-colors hover:border-indigo-500/30">
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Sem 1–8</span>
              <GraduationCap className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">All Semesters</span>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/50 dark:bg-muted/30 p-3 transition-colors hover:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">8+</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">Branches</span>
          </div>
        </div>

        {/* Branch Tags Pill Row */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">Branches:</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">CSE</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">AI & ML</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">IT</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">E&TC</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">Civil</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">Mech</span>
          <span className="rounded-md bg-secondary dark:bg-muted/60 px-2 py-0.5 font-medium">ECE</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-center cursor-pointer"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleExplore}
            className="group flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-300 text-[#ffffff] dark:text-[#09090b] px-5 py-2.5 text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <span>Explore 2026 Papers</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
