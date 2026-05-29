"""
core/boundary_detector.py
==========================
Stage 3a: Analyse OCR pages and mark which ones begin a new paper.

Boundary signals (in priority order):
  1. "SUBJECT:" line                     ← strongest
  2. University / institution header     ← strong
  3. "B.TECH" / "BACHELOR" title block   ← strong
  4. Semester line without preceding Q.  ← medium
  5. Session / year block                ← medium

A page triggers a new paper when it has enough signal weight.

Returns a list of page numbers (1-based) that start a new paper.
"""

from __future__ import annotations

import re
from typing import Any

from utils.logger import get_logger

logger = get_logger("boundary_detector")

# ---------------------------------------------------------------------------
# Signal patterns (compiled once at import time)
# ---------------------------------------------------------------------------

_SUBJECT_PATTERN = re.compile(
    r"SUBJECT\s*[:\-]\s*(.+)", re.IGNORECASE
)

_DEGREE_PATTERN = re.compile(
    r"(BACHELOR\s+OF\s+TECH|B\.?\s*TECH|B\.?\s*E\.?\b)", re.IGNORECASE
)

_SEMESTER_PATTERN = re.compile(
    r"\bSEM(ESTER)?\s*[-–]?\s*(IV|V|VI|VII|VIII|IX|X|\d{1,2})\b",
    re.IGNORECASE,
)

_SESSION_PATTERN = re.compile(
    r"\b(SUMMER|WINTER)\s*[:\-]?\s*\d{4}\b", re.IGNORECASE
)

_UNIVERSITY_PATTERN = re.compile(
    r"(UNIVERSITY|INSTITUTE\s+OF\s+TECH|COLLEGE\s+OF\s+ENGG)",
    re.IGNORECASE,
)

# Patterns that suggest a *continuation* page (not a boundary)
_QUESTION_PATTERN = re.compile(
    r"^\s*Q\s*[\.\)]\s*\d|^\s*\d+[\.\)]\s+[A-Za-z]",
    re.MULTILINE,
)


class BoundaryDetector:
    """
    Examines each OCR page and assigns a boundary score.
    Pages exceeding *boundary_threshold* are new-paper starts.
    """

    BOUNDARY_THRESHOLD = 2  # minimum total signal weight

    # Signal → weight
    SIGNAL_WEIGHTS = {
        "subject_line": 4,
        "degree_header": 2,
        "semester_line": 1,
        "session_line": 1,
        "university_header": 1,
    }

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def detect(self, ocr_pages: list[dict]) -> list[int]:
        """
        Return a sorted list of 1-based page numbers that start a new paper.
        The first readable page is *always* treated as a boundary.
        """
        boundaries: list[int] = []

        for page in ocr_pages:
            pg = page["page_number"]
            text = page["clean_text"]
            lines = page["lines"]

            score, signals = self._score_page(text, lines)
            page["boundary_score"] = score
            page["boundary_signals"] = signals

            is_boundary = score >= self.BOUNDARY_THRESHOLD

            # Force the very first page to be a boundary
            if pg == 1 and page["is_readable"]:
                is_boundary = True

            if is_boundary:
                boundaries.append(pg)
                logger.debug(
                    f"[BOUNDARY] Page {pg} → NEW PAPER "
                    f"(score={score}, signals={signals})"
                )

        # Edge case: no boundaries detected → treat page 1 as start
        if not boundaries:
            boundaries = [1]
            logger.warning("[BOUNDARY] No strong boundaries found — treating page 1 as start")

        logger.info(f"[BOUNDARY] {len(boundaries)} boundary page(s): {boundaries}")
        return boundaries

    # ------------------------------------------------------------------
    # Internal scoring
    # ------------------------------------------------------------------

    def _score_page(self, text: str, lines: list[str]) -> tuple[int, list[str]]:
        """Score a page for boundary signals. Returns (score, signal_names)."""
        score = 0
        triggered: list[str] = []

        if _SUBJECT_PATTERN.search(text):
            score += self.SIGNAL_WEIGHTS["subject_line"]
            triggered.append("subject_line")

        if _DEGREE_PATTERN.search(text):
            score += self.SIGNAL_WEIGHTS["degree_header"]
            triggered.append("degree_header")

        if _SEMESTER_PATTERN.search(text):
            score += self.SIGNAL_WEIGHTS["semester_line"]
            triggered.append("semester_line")

        if _SESSION_PATTERN.search(text):
            score += self.SIGNAL_WEIGHTS["session_line"]
            triggered.append("session_line")

        if _UNIVERSITY_PATTERN.search(text):
            score += self.SIGNAL_WEIGHTS["university_header"]
            triggered.append("university_header")

        # Downgrade: if the page is *primarily* questions, reduce score
        question_matches = len(_QUESTION_PATTERN.findall(text))
        if question_matches >= 3 and "subject_line" not in triggered:
            score = max(0, score - 2)

        return score, triggered
