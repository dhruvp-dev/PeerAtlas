"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, BookOpen, LayoutDashboard } from "lucide-react";

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
          <Image src="/Peer_Logo.svg" alt="PeerAtlas" width={24} height={24} className="h-6 w-auto" />
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
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-btn border border-border bg-white hover:bg-mist transition-colors md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? (
            <X className="h-4 w-4 text-navy-deep" />
          ) : (
            <Menu className="h-4 w-4 text-navy-deep" />
          )}
        </button>
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
