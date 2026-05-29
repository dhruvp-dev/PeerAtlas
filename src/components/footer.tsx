import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-white py-6 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 md:flex-row md:px-10">
        {/* Left Side */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Image src="/Peer_Logo.svg" alt="PeerAtlas" width={20} height={20} className="h-5 w-auto" />
            <span className="text-base font-bold tracking-tight text-navy-deep font-sans">
              Peer<span className="text-sky-blue font-medium">Atlas</span>
            </span>
          </div>
          <p className="mt-1 text-[13px] text-navy-mid/60">
            Search-first academic archive for engineering question papers.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 text-[13px] font-medium text-navy-mid/60">
          <Link href="/browse" className="transition-colors hover:text-navy-deep">
            Browse Papers
          </Link>
          <span className="text-navy-mid/30">|</span>
          <span className="text-navy-mid/50 select-none">
            Find in 5s
          </span>
        </div>
      </div>
    </footer>
  );
}
