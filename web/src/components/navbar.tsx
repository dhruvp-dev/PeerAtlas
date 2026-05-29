"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, BookOpen, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Browse", href: "/browse", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/85 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/Peer_Logo.svg" alt="" width={24} height={24} className="w-6 h-6 shrink-0 logo-light" />
          <Image src="/Dark_Peer_Logo.svg" alt="" width={24} height={24} className="w-6 h-6 shrink-0 logo-dark" />
          <span className="text-lg font-bold tracking-tight text-navy-deep font-sans">
            Peer<span className="text-sky-blue font-medium transition-colors group-hover:text-navy-mid">Atlas</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-navy-deep"
                    : "text-navy-mid/70 hover:text-navy-deep"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <a
            href="https://github.com/dhruvp-dev/PeerAtlas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-medium text-navy-mid/70 hover:text-navy-deep transition-colors duration-150"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <a
            href="https://github.com/dhruvp-dev/PeerAtlas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-border bg-white hover:bg-mist transition-colors text-navy-deep"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-border bg-white hover:bg-mist transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? (
              <X className="h-4 w-4 text-navy-deep" />
            ) : (
              <Menu className="h-4 w-4 text-navy-deep" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="border-b border-border bg-white py-3 shadow-md animate-fade-up md:hidden">
          <nav className="flex flex-col gap-1 px-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sky-tint text-navy-deep"
                      : "text-navy-mid/70 hover:bg-mist hover:text-navy-deep"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
