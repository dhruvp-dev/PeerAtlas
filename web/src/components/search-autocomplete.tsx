"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useClickOutside } from "@/lib/hooks";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (subject: string) => void;
  placeholder?: string;
  className?: string;       // for the outer wrapper
  inputClassName?: string;  // for the <input> element
  showShortcut?: boolean;   // show ⌘K badge
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search subject, branch, sem, year...",
  className = "",
  inputClassName = "",
  showShortcut = false,
  inputRef,
}: SearchAutocompleteProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use internal ref if none provided
  const internalInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = inputRef || internalInputRef;

  // Debounce the input value for querying Convex
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  // Fetch suggestions
  const suggestions = useQuery(api.papers.autocomplete, { query: debouncedValue }) || [];

  const isOpen = isFocused && value.trim().length > 0 && suggestions.length > 0;

  useClickOutside(
    dropdownRef,
    () => setIsFocused(false),
    actualInputRef as React.RefObject<HTMLElement>
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex].subject);
      } else {
        // If no suggestion selected or suggestions closed, submit the raw value
        onSelect(value);
        setIsFocused(false);
      }
      return;
    }

    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
    }
  };

  const handleSelect = (subject: string) => {
    onChange(subject);
    onSelect(subject);
    setIsFocused(false);
    setActiveIndex(-1);
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="text-sky-blue font-bold">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-4 h-5 w-5 text-navy-mid/35 pointer-events-none z-10" />

        {/* Search Input */}
        <input
          ref={actualInputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className={`h-14 w-full rounded-search border border-border bg-white pl-12 pr-[64px] text-[15px] font-medium text-navy-deep placeholder:text-navy-mid/35 transition-hover focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 ${inputClassName}`}
        />

        {/* Submit Arrow Button or Shortcut Badge */}
        {value.trim().length > 0 || isFocused ? (
          <button
            type="button"
            onClick={() => {
              onSelect(value);
              setIsFocused(false);
            }}
            aria-label="Submit search"
            className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-blue hover:bg-navy-deep text-white transition-colors duration-200 cursor-pointer z-10 shadow-sm"
          >
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        ) : (
          showShortcut && (
            <div className="absolute right-4 flex items-center gap-0.5 rounded-md border border-border bg-mist px-2 py-0.5 text-[12px] font-semibold text-navy-mid/50 select-none pointer-events-none z-10">
              /
            </div>
          )
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-dropdown border border-border bg-white shadow-dropdown z-50 overflow-hidden animate-slide-down">
          <ul className="max-h-[300px] overflow-y-auto py-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion._id}
                onClick={() => handleSelect(suggestion.subject)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex flex-col cursor-pointer px-4 py-2.5 transition-colors ${
                  index === activeIndex ? "bg-mist" : "hover:bg-mist/50"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-[14.5px] font-semibold text-navy-deep truncate">
                    {highlightMatch(suggestion.subject, debouncedValue)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
