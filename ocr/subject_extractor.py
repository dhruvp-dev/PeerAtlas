"""
extractors/subject_extractor.py
=================================
Extracts the subject name dynamically from OCR text.

Subjects are NOT hardcoded — they are extracted from the "SUBJECT:" line
in the paper header, then cleaned and normalised.

Fallback: scan for prominent title-case lines near the top of the header.
"""

from __future__ import annotations

import re
from typing import Any

from utils.logger import get_logger

logger = get_logger("subject_extractor")

# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------

# Primary: "SUBJECT: MACHINE LEARNING" or "SUBJECT - Database Management"
_SUBJECT_LINE = re.compile(
    r"SUBJECT\s*[:\-–]\s*(.{3,80})", re.IGNORECASE
)

# Sometimes it appears as "Sub.: ..." or "Sub: ..."
_SUB_SHORT = re.compile(
    r"SUB\.?\s*[:\-–]\s*(.{3,80})", re.IGNORECASE
)

# Exam / paper type suffix to strip from extracted subject
_STRIP_SUFFIXES = re.compile(
    r"\s*(QUESTION\s+PAPER|EXAM|EXAMINATION|THEORY|PRACTICAL|LAB)\s*$",
    re.IGNORECASE,
)

# Characters that should not appear in a clean subject name
_GARBAGE = re.compile(r"[^\w\s\(\)\&\-\/\,\.]")


class SubjectExtractor:
    """Dynamically extracts the subject name from a paper group's OCR text."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def extract(self, header: str, combined: str, source_path: str = "") -> dict:
        """
        Returns:
          {"value": str|None, "confidence": float, "source": str}
        """
        # 1. Primary SUBJECT: line in header
        result = self._match_subject_line(header)
        if result:
            clean = self._clean(result)
            if clean:
                return {"value": clean, "confidence": 0.95, "source": "subject_regex_header"}

        # 2. SUB: shorthand in header
        result = self._match_sub_short(header)
        if result:
            clean = self._clean(result)
            if clean:
                return {"value": clean, "confidence": 0.88, "source": "sub_regex_header"}

        # 3. SUBJECT: anywhere in full text
        result = self._match_subject_line(combined)
        if result:
            clean = self._clean(result)
            if clean:
                return {"value": clean, "confidence": 0.80, "source": "subject_regex_body"}

        # 4. Heuristic: title-case line in first 20 lines of header
        result = self._heuristic_title(header)
        if result:
            return {"value": result, "confidence": 0.55, "source": "heuristic_title"}

        # 5. Filename parse
        result = self._filename_parse(source_path)
        if result:
            return {"value": result, "confidence": 0.40, "source": "filename"}

        logger.warning("[SUBJECT] Could not extract subject")
        return {"value": None, "confidence": 0.0, "source": "none"}

    # ------------------------------------------------------------------

    def _match_subject_line(self, text: str) -> str | None:
        match = _SUBJECT_LINE.search(text)
        return match.group(1) if match else None

    def _match_sub_short(self, text: str) -> str | None:
        match = _SUB_SHORT.search(text)
        return match.group(1) if match else None

    def _clean(self, raw: str) -> str | None:
        """Strip noise and normalise a raw subject string."""
        raw = raw.strip()
        # Remove anything after a newline
        raw = raw.splitlines()[0].strip()
        # Strip trailing exam-type words
        raw = _STRIP_SUFFIXES.sub("", raw).strip()
        # Remove garbage characters
        raw = _GARBAGE.sub(" ", raw).strip()
        # Collapse multiple spaces
        raw = re.sub(r"\s+", " ", raw)
        # Title-case
        raw = raw.title()
        if len(raw) < 3:
            return None
        return raw

    def _heuristic_title(self, header: str) -> str | None:
        """
        Scan the first 20 lines of the header for a short ALL-CAPS or
        Title-Case line that looks like a subject title.
        Skip lines that look like institution names or degree labels.
        """
        SKIP_PATTERNS = re.compile(
            r"BACHELOR|B\.TECH|UNIVERSITY|INSTITUTE|SEMESTER|SEM\s|"
            r"SUMMER|WINTER|SESSION|^\d+$|PAGE|ROLL|MARKS|TIME|DURATION",
            re.IGNORECASE,
        )
        lines = header.splitlines()[:20]
        candidates = []
        for line in lines:
            line = line.strip()
            if len(line) < 5 or len(line) > 80:
                continue
            if SKIP_PATTERNS.search(line):
                continue
            # Prefer ALL-CAPS subject lines
            if line.isupper() and len(line.split()) >= 2:
                candidates.append(line.title())
            elif re.match(r"^[A-Z][a-z]", line) and len(line.split()) >= 2:
                candidates.append(line)

        return candidates[0] if candidates else None

    def _filename_parse(self, source_path: str) -> str | None:
        """Extract a probable subject from the filename as last resort."""
        import os
        name = os.path.splitext(os.path.basename(source_path))[0]
        name = name.replace("_", " ").replace("-", " ")
        # Remove common suffixes
        name = re.sub(r"\b(SUMMER|WINTER|20\d\d|SEM\d?)\b", "", name, flags=re.IGNORECASE)
        name = re.sub(r"\s+", " ", name).strip()
        return name.title() if len(name) > 3 else None
