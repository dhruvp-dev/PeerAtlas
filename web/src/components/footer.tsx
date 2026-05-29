import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-white py-6 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 md:flex-row md:px-10">
        {/* Left Side */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Image src="/Peer_Logo.svg" alt="" width={20} height={20} className="w-5 h-5 shrink-0 logo-light" />
            <Image src="/Dark_Peer_Logo.svg" alt="" width={20} height={20} className="w-5 h-5 shrink-0 logo-dark" />
            <span className="text-base font-bold tracking-tight text-navy-deep font-sans">
              Peer<span className="text-sky-blue font-medium">Atlas</span>
            </span>
          </div>
          <p className="mt-1 text-[13px] font-medium text-navy-mid/70">
            Built by students, for students.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-center md:items-end gap-1.5 mt-4 md:mt-0 text-[13px] font-medium text-navy-mid/60">
          <div className="flex items-center gap-3">
            <Link href="/about" className="transition-colors hover:text-navy-deep">
              About
            </Link>
            <span className="text-navy-mid/30 select-none">&bull;</span>
            <Link href="/browse" className="transition-colors hover:text-navy-deep">
              Browse Papers
            </Link>
            <span className="text-navy-mid/30 select-none">&bull;</span>
            <a href="https://github.com/dhruvp-dev/PeerAtlas" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-navy-deep">
              GitHub
            </a>
            <span className="text-navy-mid/30 select-none">&bull;</span>
            <a href="https://github.com/dhruvp-dev/PeerAtlas/issues" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-navy-deep">
              Report Issue
            </a>
          </div>
          <span className="text-[12px] text-navy-mid/50 select-none">
            &copy; {new Date().getFullYear()} <a href="https://www.dhruvp.tech" target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors hover:text-navy-deep">Dhruv</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
