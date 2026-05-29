"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchAutocomplete } from "@/components/search-autocomplete";

export function HeroClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="mt-6 md:mt-8 relative w-full">
      <SearchAutocomplete
        value={query}
        onChange={setQuery}
        onSelect={(val) => {
          if (val.trim()) {
            router.push(`/browse?q=${encodeURIComponent(val.trim())}`);
          } else {
            router.push("/browse");
          }
        }}
        showShortcut={true}
        inputRef={inputRef}
      />
    </form>
  );
}
