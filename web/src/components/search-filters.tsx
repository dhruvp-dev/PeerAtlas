"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { slugify } from "@/lib/utils";

export type FilterKey = "branch" | "semester" | "session" | "year";

export const FILTER_OPTIONS = {
  branch: [
    "Artificial Intelligence and Machine Learning",
    "Computer Science and Business Systems",
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Telecommunication Engineering",
    "Civil Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
  ],
  semester: ["1", "2", "3", "4", "5", "6", "7", "8"],
  session: ["Winter", "Summer"],
  year: ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"],
} as const;

interface SearchFiltersProps {
  selectedFilters: Record<FilterKey, string[]>;
  onToggleFilter: (key: FilterKey, val: string) => void;
  onRemoveChip: (key: FilterKey, val: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function SearchFilters({
  selectedFilters,
  onToggleFilter,
  onRemoveChip,
  onClearFilters,
  hasActiveFilters,
  className = "",
}: SearchFiltersProps) {
  const [activeDropdown, setActiveDropdown] = useState<FilterKey | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filterLabels: Record<FilterKey, string> = {
    branch: "Branch",
    semester: "Semester",
    session: "Session",
    year: "Year",
  };

  const getButtonLabel = (key: FilterKey) => {
    const selected = selectedFilters[key];
    if (selected.length === 1) {
      return key === "semester" ? `Semester ${selected[0]}` : selected[0];
    }
    return filterLabels[key];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Row */}
      <div ref={dropdownRef} className="relative z-40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2 w-full">
            {(Object.keys(filterLabels) as FilterKey[]).map((key) => {
              const isSelected = selectedFilters[key].length > 0;
              const isOpen = activeDropdown === key;

              return (
                <div key={key} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : key)}
                    className={`flex h-[38px] items-center gap-1.5 rounded-btn border px-3.5 text-xs font-semibold select-none transition-hover ${
                      isSelected
                        ? "border-sky-blue bg-sky-tint text-navy-deep"
                        : "border-border bg-white text-navy-mid/70 hover:border-sky-blue hover:text-navy-deep"
                    }`}
                  >
                    <span>{getButtonLabel(key)}</span>
                    {selectedFilters[key].length > 1 ? (
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-navy-deep text-[10px] font-bold text-white shrink-0">
                        {selectedFilters[key].length}
                      </span>
                    ) : null}
                    <ChevronDown className={`h-3.5 w-3.5 text-navy-mid/40 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Absolute Dropdown Panel */}
                  {isOpen ? (
                    <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-dropdown border border-border bg-white p-2 shadow-dropdown z-50 animate-fade-up">
                      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar">
                        {FILTER_OPTIONS[key].map((option) => {
                          const isChecked = selectedFilters[key].includes(option);
                          return (
                            <button
                              type="button"
                              key={option}
                              onClick={() => onToggleFilter(key, option)}
                              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-semibold transition-hover ${
                                isChecked
                                  ? "bg-sky-tint text-navy-deep"
                                  : "text-navy-mid hover:bg-mist"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Controlled via button click
                                className="h-3.5 w-3.5 rounded border-border text-sky-blue accent-sky-blue shrink-0 pointer-events-none"
                              />
                              <span className="whitespace-normal break-words">
                                {key === "semester" ? `Semester ${option}` : option}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* Clear All action */}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs font-semibold text-sky-blue hover:text-navy-deep select-none px-2 py-1"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {Object.entries(selectedFilters).some(([_, vals]) => vals.length > 0) ? (
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-mid/40 shrink-0">
            Active filters:
          </span>
          <div className="flex items-center gap-1.5">
            {(Object.keys(selectedFilters) as FilterKey[]).map((key) =>
              selectedFilters[key].map((val) => (
                <div
                  key={`${key}-${val}`}
                  className="flex h-7 items-center gap-1 rounded-full bg-navy-deep px-3 text-xs font-semibold text-white shrink-0 select-none"
                >
                  <span>
                    {key === "semester" ? `Sem ${val}` : val}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveChip(key, val)}
                    className="hover:opacity-75"
                    aria-label="Remove filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
