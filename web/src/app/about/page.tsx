import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PeerAtlas — Helping Students Find Academic Papers",
  description: "Learn about the mission of PeerAtlas. Report academic resource issues, contact the author directly, or contribute question papers to help other students.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-12 pb-8 md:pt-16 md:pb-10 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-deep sm:text-3xl font-sans">
          About PeerAtlas
        </h1>
        <p className="mt-1.5 text-sm text-navy-mid/60">
          A clean, open-source engineering question paper archive.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-navy-mid/70">
        <p>
          I built PeerAtlas because I got tired of searching for question papers the same way everyone else does, through endless Google Drive folders and links that somehow disappear right when you need them most.
        </p>
        <p>
          It always felt strange to me. Finding a paper shouldn't be harder than preparing for the exam itself, right?
        </p>
        <p>
          So I decided to create a place where everything is organized properly. Papers are grouped by branch, semester, subject, and year, making it easy to find exactly what you're looking for in a few seconds.
        </p>
        <p>
          My goal with PeerAtlas is simple, make academic resources easier to find without the usual friction. Just a clean and searchable archive that helps you get to what you need and get back to studying.
        </p>
        <p>
          Right now, the focus is on previous year question papers. In the future, I plan to expand PeerAtlas with practical files, unit test papers, notes, and other useful academic resources, so students can find everything they need in one place instead of jumping between five different apps and folders.
        </p>
        <p className="italic font-medium text-navy-deep dark:text-sky-blue/90 mt-6 pt-4 border-t border-border/40">
          "Whether you're starting your preparation on the very first day of the semester, revising a week before exams, or sitting with a cup of chai the night before an exam trying to squeeze in one last revision session, or starting your study session just a day before the exam like me, I hope PeerAtlas saves you a little time and a lot of frustration."
        </p>
      </div>

      {/* Get Involved / Simple text-driven section */}
      <div className="mt-14 border-t border-border pt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-mid/45">
          Get Involved
        </h2>

        <div className="mt-6 space-y-6">
          {/* Item 1: Report Issue */}
          <div>
            <h3 className="text-[14.5px] font-semibold text-navy-deep">
              Something looks wrong?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-navy-mid/60">
              Found a missing paper, broken link, or weird metadata? Let me know and I'll fix it.
            </p>
            <a
              href="https://github.com/dhruvp-dev/PeerAtlas/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs font-semibold text-sky-blue hover:text-navy-deep transition-colors group"
            >
              Report Issue on GitHub <span className="ml-0.5 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>

          {/* Item 2: Contribute Papers */}
          <div>
            <h3 className="text-[14.5px] font-semibold text-navy-deep">
              Help grow PeerAtlas
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-navy-mid/60">
              Got papers sitting in a folder somewhere? Send them over and help future students.
            </p>
            <a
              href="mailto:dhruvpandey20012@gmail.com?subject=PeerAtlas%20-%20Question%20Paper%20Contribution&body=Hi%20Dhruv%2C%0A%0AI%20have%20some%20question%20papers%20I'd%20like%20to%20contribute%20to%20PeerAtlas!%0A%0AHere%20are%20the%20details%3A%0A-%20Subject%20Name%3A%20%0A-%20Branch%20%2F%20Department%3A%20%0A-%20Semester%20(1-8)%3A%20%0A-%20Exam%20Type%20(Unit%20Test%20%2F%20End-Sem%20%2F%20etc)%3A%20%0A-%20Year%3A%20%0A%0A%5BPlease%20attach%20your%20PDF%20or%20images%20of%20the%20papers%20to%20this%20email.%5D%0A%0AThank%20you%20for%20helping%20fellow%20students!"
              className="mt-2 inline-flex items-center text-xs font-semibold text-sky-blue hover:text-navy-deep transition-colors group"
            >
              Contribute Papers <span className="ml-0.5 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>

          {/* Item 3: Feedback */}
          <div>
            <h3 className="text-[14.5px] font-semibold text-navy-deep">
              Want to talk?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-navy-mid/60">
              Ideas, feedback, partnerships, random thoughts about the site—my inbox is open.
            </p>
            <a
              href="mailto:dhruvpandey20012@gmail.com"
              className="mt-2 inline-flex items-center text-xs font-semibold text-sky-blue hover:text-navy-deep transition-colors group"
            >
              Email Me Directly <span className="ml-0.5 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Analytics Notice Footnote */}
      <div className="mt-10 border-t border-border/40 pt-4 text-[11px] leading-relaxed text-navy-mid/45">
        Anonymous usage analytics help improve PeerAtlas and identify the papers students find most useful.
      </div>
    </div>
  );
}
