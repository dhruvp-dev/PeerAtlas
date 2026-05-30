import Link from "next/link";
import { Search, Home, ChevronRight, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 md:py-24 animate-fade-up text-center">
      {/* 404 Visual Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-tint text-sky-blue dark:bg-sky-tint/10 dark:text-sky-blue select-none anim-1">
        <HelpCircle className="h-7 w-7" />
      </div>

      {/* Main Heading */}
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy-deep sm:text-4xl leading-tight font-sans anim-2">
        This paper seems to be misfiled.
      </h1>

      {/* Supportive, stress-free subtitle */}
      <p className="mx-auto mt-3.5 max-w-md text-sm leading-relaxed text-navy-mid/65 dark:text-navy-mid anim-3">
        Exam preparation is stressful enough without running into dead ends. The page or paper you are looking for has either been relocated or doesn't exist. Let's get you back on track.
      </p>

      {/* Helpful Quick Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center anim-4">
        <Link
          href="/"
          className="flex h-11 items-center justify-center gap-2 rounded-btn bg-navy-deep px-5 text-xs font-semibold text-white dark:bg-sky-blue dark:text-white transition-hover hover:bg-sky-blue dark:hover:bg-sky-blue/90 shadow-sm cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/browse"
          className="flex h-11 items-center justify-center gap-2 rounded-btn border border-border bg-white dark:bg-mist dark:border-none px-5 text-xs font-semibold text-navy-deep transition-hover hover:bg-mist dark:hover:bg-mist/80 cursor-pointer"
        >
          <Search className="h-4 w-4 text-sky-blue" />
          <span>Browse Papers</span>
          <ChevronRight className="h-3.5 w-3.5 text-navy-mid/40" />
        </Link>
      </div>

      {/* Subtle extra tip */}
      <p className="mt-12 text-xs text-navy-mid/45 anim-5">
        Think this is a mistake? You can always{" "}
        <Link href="/about" className="underline hover:text-sky-blue transition-colors">
          contact us
        </Link>{" "}
        or report an issue.
      </p>
    </div>
  );
}
