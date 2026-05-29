"""
extractors/branch_extractor.py
================================
Extracts and normalises the branch / department name from OCR text.

Strategy (layered fallback):
  1. Regex scan for known branch keywords in header text
  2. Fuzzy matching against alias table
  3. Filename / path heuristics
"""

from __future__ import annotations

import re
from typing import Any

from utils.logger import get_logger

logger = get_logger("branch_extractor")

try:
    from rapidfuzz import fuzz, process as fuzz_process
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False
    logger.warning("rapidfuzz not installed — fuzzy branch matching disabled")


# ---------------------------------------------------------------------------
# Canonical branch definitions + aliases
# ---------------------------------------------------------------------------

BRANCH_ALIASES: dict[str, list[str]] = {
    "Computer Science and Engineering": [
        "computer science and engineering",
        "computer science & engineering",
        "cse",
        "computer engineering",
        "computer engg",
        "comp. sci. engg",
        "comp sci eng",
        "cs & e",
    ],
    "Computer Science and Business Systems": [
        "computer science and business systems",
        "csbs",
        "cs & bs",
        "computer science business systems",
        "business systems",
    ],
    "Artificial Intelligence and Machine Learning": [
        "artificial intelligence and machine learning",
        "artificial intelligence & machine learning",
        "ai and machine learning",
        "ai & ml",
        "aiml",
        "ai ml",
        "artificial intelligence machine learning",
        "computer science ai & ml",
        "cse ai & ml",
        "cse aiml",
    ],
    "Information Technology": [
        "information technology",
        "info tech",
        "infotech",
        "it",
        "i.t.",
    ],
    "Electronics and Communication Engineering": [
        "electronics and communication engineering",
        "electronics & communication engineering",
        "ece",
        "e&c",
        "electronics communication",
        "electronic communication engg",
    ],
    "Mechanical Engineering": [
        "mechanical engineering",
        "mechanical engg",
        "mech engg",
        "me",
    ],
    "Civil Engineering": [
        "civil engineering",
        "civil engg",
        "ce",
    ],
    "Electrical Engineering": [
        "electrical engineering",
        "electrical engg",
        "ee",
        "eee",
        "electrical & electronics",
    ],
}

# Flatten for fuzzy matching: alias_lower → canonical
_ALIAS_MAP: dict[str, str] = {
    alias: canonical
    for canonical, aliases in BRANCH_ALIASES.items()
    for alias in aliases
}

# Build regex pattern for each canonical branch (longest aliases first to avoid partial matches)
_BRANCH_PATTERNS: list[tuple[re.Pattern, str]] = []
for canonical, aliases in BRANCH_ALIASES.items():
    sorted_aliases = sorted(aliases, key=len, reverse=True)
    pattern_str = "|".join(re.escape(a) for a in sorted_aliases)
    _BRANCH_PATTERNS.append(
        (re.compile(pattern_str, re.IGNORECASE), canonical)
    )


class BranchExtractor:
    """Extracts the canonical branch name from OCR text."""

    FUZZY_THRESHOLD = 70  # rapidfuzz score threshold (0–100)

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def extract(self, header: str, combined: str, source_path: str = "") -> dict:
        """
        Returns:
          {"value": str|None, "confidence": float, "source": str}
        """
        # 1. Regex scan on header (most reliable region)
        result = self._regex_scan(header)
        if result:
            return {"value": result, "confidence": 0.95, "source": "header_regex"}

        # 2. Regex scan on full combined text
        result = self._regex_scan(combined)
        if result:
            return {"value": result, "confidence": 0.85, "source": "body_regex"}

        # 3. Fuzzy matching on header lines
        if RAPIDFUZZ_AVAILABLE:
            result = self._fuzzy_match(header)
            if result:
                branch, score = result
                return {
                    "value": branch,
                    "confidence": round(score / 100, 2),
                    "source": "fuzzy_header",
                }

        # 4. Fallback: parse source filename
        result = self._filename_parse(source_path)
        if result:
            return {"value": result, "confidence": 0.55, "source": "filename"}

        logger.warning("[BRANCH] Could not extract branch")
        return {"value": None, "confidence": 0.0, "source": "none"}

    # ------------------------------------------------------------------

    def _regex_scan(self, text: str) -> str | None:
        for pattern, canonical in _BRANCH_PATTERNS:
            if pattern.search(text):
                return canonical
        return None

    def _fuzzy_match(self, text: str) -> tuple[str, float] | None:
        """
        Run rapidfuzz against all alias strings.
        Returns (canonical_branch, score) or None.
        """
        all_aliases = list(_ALIAS_MAP.keys())
        # Check each line of the header for a strong fuzzy match
        for line in text.splitlines():
            line = line.strip().lower()
            if len(line) < 4:
                continue
            match = fuzz_process.extractOne(
                line, all_aliases, scorer=fuzz.partial_ratio
            )
            if match and match[1] >= self.FUZZY_THRESHOLD:
                matched_alias, score, _ = match
                canonical = _ALIAS_MAP[matched_alias]
                return canonical, float(score)
        return None

    def _filename_parse(self, source_path: str) -> str | None:
        name = source_path.lower().replace("-", " ").replace("_", " ")
        for pattern, canonical in _BRANCH_PATTERNS:
            if pattern.search(name):
                return canonical
        return None
