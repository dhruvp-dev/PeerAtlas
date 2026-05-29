"""
extractors/metadata_extractor.py
==================================
Stage 4: Extract structured metadata from a paper group's OCR text.

Uses a layered fallback strategy:
  1. Structured regex on header text
  2. Fuzzy matching against known aliases
  3. Heuristic title scanning
  4. Filename / path parsing (if available)

Every field includes a confidence score and extraction source.
"""

from __future__ import annotations

import re
import hashlib
from typing import Any

from extractors.branch_extractor import BranchExtractor
from extractors.semester_extractor import SemesterExtractor
from extractors.subject_extractor import SubjectExtractor
from extractors.session_extractor import SessionExtractor
from utils.slugify import slugify
from utils.logger import get_logger

logger = get_logger("metadata_extractor")


class MetadataExtractor:
    """
    Orchestrates all sub-extractors and assembles the final metadata dict
    for one paper group.
    """

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.branch_extractor = BranchExtractor(config)
        self.semester_extractor = SemesterExtractor(config)
        self.subject_extractor = SubjectExtractor(config)
        self.session_extractor = SessionExtractor(config)

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def extract(self, group: dict) -> dict:
        """
        Build and return a metadata dict for the given paper group.
        All fields are present; unknown values default to None / 0.0 confidence.
        """
        header = group["header_text"]
        combined = group["combined_text"]
        source_pdf = group.get("source_pdf", "")

        # Run each extractor
        branch_result   = self.branch_extractor.extract(header, combined, source_pdf)
        semester_result = self.semester_extractor.extract(header, combined, source_pdf)
        subject_result  = self.subject_extractor.extract(header, combined, source_pdf)
        session_result  = self.session_extractor.extract(header, combined, source_pdf)

        branch   = branch_result.get("value")
        semester = semester_result.get("value")
        subject  = subject_result.get("value")
        session  = session_result.get("session")
        year     = session_result.get("year")

        # Build slugs
        branch_slug  = slugify(branch)  if branch  else "unknown"
        subject_slug = slugify(subject) if subject else "unknown"

        # Build keyword list
        keywords = self._build_keywords(branch, semester, subject, session, year)

        # Compute SHA-256 hash of combined text for duplicate detection
        text_hash = hashlib.sha256(combined.encode("utf-8", errors="replace")).hexdigest()

        metadata = {
            # Core fields
            "branch":            branch,
            "branchSlug":        branch_slug,
            "branchConfidence":  branch_result.get("confidence", 0.0),
            "branchSource":      branch_result.get("source", "unknown"),

            "semester":          semester,
            "semesterConfidence": semester_result.get("confidence", 0.0),
            "semesterSource":    semester_result.get("source", "unknown"),

            "subjectOriginal":   subject,
            "subjectSlug":       subject_slug,
            "subjectConfidence": subject_result.get("confidence", 0.0),
            "subjectSource":     subject_result.get("source", "unknown"),

            "year":              year,
            "session":           session,
            "sessionConfidence": session_result.get("confidence", 0.0),
            "sessionSource":     session_result.get("source", "unknown"),

            # Page info
            "startPage":         group["start_page"],
            "endPage":           group["end_page"],
            "pageCount":         group["page_count"],
            "partialPaper":      group.get("partial_paper", False),

            # Searchable content
            "searchableText":    combined,
            "ocrPreview":        combined[:500],
            "textHash":          text_hash,

            # Convex helpers
            "keywords":          keywords,

            # Review flag (will be overridden by orchestrator)
            "requiresReview":    False,
            "reviewIssues":      [],
        }

        self._log_extraction(metadata)
        return metadata

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _build_keywords(
        self,
        branch: str | None,
        semester: int | None,
        subject: str | None,
        session: str | None,
        year: int | None,
    ) -> list[str]:
        kws: list[str] = []
        if subject:
            kws.append(subject.lower())
            kws.append(slugify(subject))
        if branch:
            kws.append(branch.lower())
            # Add common abbreviation
            words = branch.split()
            abbr = "".join(w[0] for w in words if w[0].isupper()).lower()
            if len(abbr) >= 2:
                kws.append(abbr)
        if semester:
            kws.append(f"semester {semester}")
            kws.append(f"sem {semester}")
        if session and year:
            kws.append(f"{session.lower()} {year}")
        if year:
            kws.append(str(year))
        return list(dict.fromkeys(kws))  # deduplicate preserving order

    def _log_extraction(self, m: dict) -> None:
        logger.info(
            f"[META] subject='{m['subjectOriginal']}' ({m['subjectConfidence']:.0%}) | "
            f"branch='{m['branch']}' ({m['branchConfidence']:.0%}) | "
            f"sem={m['semester']} | {m['session']} {m['year']}"
        )
