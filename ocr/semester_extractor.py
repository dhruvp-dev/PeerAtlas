"""
extractors/semester_extractor.py
==================================
Extracts and normalises semester number (as integer) from OCR text.

Handles:
  - "Sem - V"  → 5
  - "SEM 4"    → 4
  - "Semester VI" → 6
  - "B.Tech. Sem-III" → 3
"""

from __future__ import annotations

import re
from typing import Any

from utils.logger import get_logger

logger = get_logger("semester_extractor")

# ---------------------------------------------------------------------------
# Roman numeral mapping
# ---------------------------------------------------------------------------

ROMAN_TO_INT: dict[str, int] = {
    "I": 1, "II": 2, "III": 3, "IV": 4,
    "V": 5, "VI": 6, "VII": 7, "VIII": 8,
    "IX": 9, "X": 10,
}

_ROMAN_PATTERN_STR = "|".join(
    sorted(ROMAN_TO_INT.keys(), key=len, reverse=True)
)

# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------

# e.g. "Sem - V", "Semester VI", "SEM 4", "Sem-III"
_SEM_PATTERN = re.compile(
    rf"SEM(?:ESTER)?\s*[-–\s]?\s*({_ROMAN_PATTERN_STR}|\d{{1,2}})\b",
    re.IGNORECASE,
)

# "B.Tech. Sem V" or "B. Tech Semester 5"
_BTECH_SEM_PATTERN = re.compile(
    rf"B\.?\s*TECH\.?\s+SEM(?:ESTER)?\s*[-–\s]?\s*({_ROMAN_PATTERN_STR}|\d{{1,2}})\b",
    re.IGNORECASE,
)

# Filename: "SEM_5", "SEM5", "_S5_"
_FILENAME_SEM = re.compile(r"SEM[-_]?(\d{1,2})", re.IGNORECASE)


class SemesterExtractor:
    """Extracts and normalises the semester number."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def extract(self, header: str, combined: str, source_path: str = "") -> dict:
        """
        Returns:
          {"value": int|None, "confidence": float, "source": str}
        """
        # 1. B.Tech specific pattern (most reliable)
        result = self._match_pattern(_BTECH_SEM_PATTERN, header)
        if result is not None:
            return {"value": result, "confidence": 0.95, "source": "btech_header_regex"}

        # 2. Generic semester pattern on header
        result = self._match_pattern(_SEM_PATTERN, header)
        if result is not None:
            return {"value": result, "confidence": 0.90, "source": "header_regex"}

        # 3. Generic semester pattern on full text
        result = self._match_pattern(_SEM_PATTERN, combined)
        if result is not None:
            return {"value": result, "confidence": 0.80, "source": "body_regex"}

        # 4. Filename
        result = self._filename_parse(source_path)
        if result is not None:
            return {"value": result, "confidence": 0.55, "source": "filename"}

        logger.warning("[SEMESTER] Could not extract semester")
        return {"value": None, "confidence": 0.0, "source": "none"}

    # ------------------------------------------------------------------

    def _match_pattern(self, pattern: re.Pattern, text: str) -> int | None:
        match = pattern.search(text)
        if not match:
            return None
        token = match.group(1).strip().upper()
        return self._normalise(token)

    @staticmethod
    def _normalise(token: str) -> int | None:
        if token in ROMAN_TO_INT:
            return ROMAN_TO_INT[token]
        try:
            val = int(token)
            if 1 <= val <= 10:
                return val
        except ValueError:
            pass
        return None

    def _filename_parse(self, source_path: str) -> int | None:
        match = _FILENAME_SEM.search(source_path)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                pass
        return None
