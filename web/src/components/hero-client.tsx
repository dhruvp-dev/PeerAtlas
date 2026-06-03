"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { SearchFilters, FilterKey } from "@/components/search-filters";
import { slugify } from "@/lib/utils";

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

  const handleToggleFilter = (key: FilterKey, val: string) => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    params.set(key, key === "branch" ? slugify(val) : val);
    router.push(`/browse?${params.toString()}`);
  };

  const emptyFilters = {
    branch: [],
    semester: [],
    session: [],
    year: [],
  };

  return (
    <div className="mt-6 md:mt-8 relative w-full flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
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
      
      {/* Reusable Search Filters dropdowns */}
      <SearchFilters
        selectedFilters={emptyFilters}
        onToggleFilter={handleToggleFilter}
        onRemoveChip={() => {}}
        onClearFilters={() => {}}
        hasActiveFilters={false}
        className="self-center"
      />
    </div>
  );
}
