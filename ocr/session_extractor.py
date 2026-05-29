"""
extractors/session_extractor.py
=================================
Extracts session (SUMMER / WINTER) and year from OCR text.

Examples:
  "SUMMER : 2025"   → session=Summer, year=2025
  "WINTER 2024"     → session=Winter, year=2024
  "Nov-Dec 2024"    → session=Winter, year=2024  (heuristic)
  "May-Jun 2025"    → session=Summer, year=2025  (heuristic)
"""

from __future__ import annotations

import re
from typing import Any

from utils.logger import get_logger

logger = get_logger("session_extractor")

# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------

_SESSION_YEAR_PATTERN = re.compile(
    r"\b(SUMMER|WINTER)\s*[:\-–]?\s*(20\d{2}|19\d{2})\b",
    re.IGNORECASE,
)

_YEAR_ONLY_PATTERN = re.compile(r"\b(20\d{2}|19\d{2})\b")

# Month-based session heuristics
_SUMMER_MONTHS = re.compile(
    r"\b(MAY|JUN|JUNE|APR|APRIL)\b", re.IGNORECASE
)
_WINTER_MONTHS = re.compile(
    r"\b(NOV|DEC|DECEMBER|NOVEMBER|OCT|OCTOBER)\b", re.IGNORECASE
)

_FILENAME_SESSION = re.compile(r"\b(SUMMER|WINTER)\b", re.IGNORECASE)
_FILENAME_YEAR = re.compile(r"\b(20\d{2})\b")


class SessionExtractor:
    """Extracts session and year from header / combined text."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def extract(self, header: str, combined: str, source_path: str = "") -> dict:
        """
        Returns:
          {
            "session": "Summer"|"Winter"|None,
            "year": int|None,
            "confidence": float,
            "source": str,
          }
        """
        # 1. Explicit "SUMMER : 2025" pattern in header
        result = self._match_session_year(header)
        if result["session"]:
            return {**result, "confidence": 0.95, "source": "header_regex"}

        # 2. Same in full text
        result = self._match_session_year(combined)
        if result["session"]:
            return {**result, "confidence": 0.85, "source": "body_regex"}

        # 3. Derive session from month names
        month_result = self._month_heuristic(header + "\n" + combined)
        year = self._extract_year(header) or self._extract_year(combined)
        if month_result:
            return {
                "session": month_result, "year": year,
                "confidence": 0.70, "source": "month_heuristic",
            }

        # 4. Filename fallback
        result = self._filename_parse(source_path)
        if result["session"] or result["year"]:
            return {**result, "confidence": 0.50, "source": "filename"}

        # 5. Year only (session unknown)
        if year:
            return {
                "session": None, "year": year,
                "confidence": 0.40, "source": "year_only",
            }

        logger.warning("[SESSION] Could not extract session or year")
        return {"session": None, "year": None, "confidence": 0.0, "source": "none"}

    # ------------------------------------------------------------------

    def _match_session_year(self, text: str) -> dict:
        match = _SESSION_YEAR_PATTERN.search(text)
        if match:
            session = match.group(1).capitalize()
            year = int(match.group(2))
            return {"session": session, "year": year}
        return {"session": None, "year": None}

    def _extract_year(self, text: str) -> int | None:
        match = _YEAR_ONLY_PATTERN.search(text)
        return int(match.group(1)) if match else None

    def _month_heuristic(self, text: str) -> str | None:
        if _SUMMER_MONTHS.search(text):
            return "Summer"
        if _WINTER_MONTHS.search(text):
            return "Winter"
        return None

    def _filename_parse(self, source_path: str) -> dict:
        session = None
        year = None
        # Normalise separators so "AIML_SUMMER_2025" becomes "AIML SUMMER 2025"
        normalised = source_path.replace("_", " ").replace("-", " ")
        sm = _FILENAME_SESSION.search(normalised)
        if sm:
            session = sm.group(1).capitalize()
        ym = _FILENAME_YEAR.search(normalised)
        if ym:
            year = int(ym.group(1))
        return {"session": session, "year": year}
