"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
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

  // Handle open state based on focus and suggestions
  useEffect(() => {
    if (value.trim() && suggestions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }
  }, [value, suggestions]);

  // Reset active index when value changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(-1);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        actualInputRef.current &&
        !actualInputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actualInputRef]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex].subject);
      } else {
        // If no suggestion selected, submit the raw value
        onSelect(value);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (subject: string) => {
    onChange(subject);
    onSelect(subject);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, "gi"));
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
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value.trim() && suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`h-14 w-full rounded-search border border-border bg-white pl-12 pr-[64px] text-[15px] font-medium text-navy-deep placeholder:text-navy-mid/35 transition-hover focus:border-sky-blue focus:outline-none focus:ring-[3px] focus:ring-sky-blue/15 ${inputClassName}`}
        />

        {/* Shortcut Badge */}
        {showShortcut && (
          <div className="absolute right-4 flex items-center gap-0.5 rounded-md border border-border bg-mist px-2 py-0.5 text-[12px] font-semibold text-navy-mid/50 select-none pointer-events-none z-10">
            /
          </div>
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
