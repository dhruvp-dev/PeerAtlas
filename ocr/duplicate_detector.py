"""
exporters/duplicate_detector.py
=================================
Detects duplicate papers within a processed batch.

A duplicate is defined as two papers with:
  - same branch
  - same semester
  - same subject (slug)
  - same session + year
  - high OCR text similarity (≥ 85%)

On detection:
  - Both records are flagged
  - Neither is deleted automatically
  - Both are routed to duplicate_review/ for human decision

Uses:
  - SHA-256 hash (exact duplicate)
  - rapidfuzz token_sort_ratio (near-duplicate OCR)
  - Metadata equality check
"""

from __future__ import annotations

from typing import Any

from utils.logger import get_logger

logger = get_logger("duplicate_detector")

try:
    from rapidfuzz import fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False

OCR_SIMILARITY_THRESHOLD = 85   # rapidfuzz score (0–100)
TEXT_SAMPLE_LENGTH = 3000       # chars to compare (avoids huge strings)


class DuplicateDetector:
    """
    Identifies likely duplicate papers in a batch of metadata records.
    Returns a list of (record_a, record_b, similarity_score) tuples.
    """

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def detect(self, metadata_list: list[dict]) -> list[dict]:
        """
        Scan all pairs in *metadata_list* for duplicates.
        Returns list of duplicate-pair dicts.
        """
        if len(metadata_list) < 2:
            return []

        duplicates: list[dict] = []
        n = len(metadata_list)

        for i in range(n):
            for j in range(i + 1, n):
                a = metadata_list[i]
                b = metadata_list[j]

                pair = self._compare(a, b)
                if pair:
                    duplicates.append(pair)
                    logger.warning(
                        f"[DUPE] Duplicate detected: "
                        f"'{a.get('subjectSlug')}' ↔ '{b.get('subjectSlug')}' "
                        f"(sim={pair['similarity']:.0%})"
                    )
                    a["isDuplicate"] = True
                    b["isDuplicate"] = True

        if duplicates:
            logger.warning(f"[DUPE] {len(duplicates)} duplicate pair(s) found")
        else:
            logger.info("[DUPE] No duplicates detected")

        return duplicates

    # ------------------------------------------------------------------

    def _compare(self, a: dict, b: dict) -> dict | None:
        """
        Return a duplicate-pair dict if a & b are duplicates, else None.
        """
        # Fast path: exact SHA-256 match
        if a.get("textHash") and a["textHash"] == b.get("textHash"):
            return self._pair(a, b, 1.0, "exact_hash")

        # Metadata must match on all key fields
        if not self._metadata_match(a, b):
            return None

        # OCR similarity check
        sim = self._ocr_similarity(a, b)
        if sim >= OCR_SIMILARITY_THRESHOLD / 100:
            return self._pair(a, b, sim, "ocr_similarity")

        return None

    @staticmethod
    def _metadata_match(a: dict, b: dict) -> bool:
        """Return True if all key metadata fields agree."""
        fields = ["branchSlug", "semester", "subjectSlug", "session", "year"]
        for f in fields:
            va, vb = a.get(f), b.get(f)
            if va is None or vb is None:
                continue  # missing field → skip check
            if str(va).lower() != str(vb).lower():
                return False
        return True

    @staticmethod
    def _ocr_similarity(a: dict, b: dict) -> float:
        """Compute text similarity between two papers' OCR content."""
        if not RAPIDFUZZ_AVAILABLE:
            # Fallback: simple character-level comparison
            ta = (a.get("searchableText") or "")[:TEXT_SAMPLE_LENGTH]
            tb = (b.get("searchableText") or "")[:TEXT_SAMPLE_LENGTH]
            if not ta or not tb:
                return 0.0
            common = sum(ca == cb for ca, cb in zip(ta, tb))
            return common / max(len(ta), len(tb))

        ta = (a.get("searchableText") or "")[:TEXT_SAMPLE_LENGTH]
        tb = (b.get("searchableText") or "")[:TEXT_SAMPLE_LENGTH]
        if not ta or not tb:
            return 0.0
        score = fuzz.token_sort_ratio(ta, tb)
        return score / 100.0

    @staticmethod
    def _pair(a: dict, b: dict, similarity: float, method: str) -> dict:
        return {
            "paperA": {
                "subject": a.get("subjectOriginal"),
                "exportedPath": a.get("exportedPath"),
                "textHash": a.get("textHash"),
                "pageRange": f"{a.get('startPage')}–{a.get('endPage')}",
            },
            "paperB": {
                "subject": b.get("subjectOriginal"),
                "exportedPath": b.get("exportedPath"),
                "textHash": b.get("textHash"),
                "pageRange": f"{b.get('startPage')}–{b.get('endPage')}",
            },
            "similarity": similarity,
            "method": method,
            "branch": a.get("branch"),
            "semester": a.get("semester"),
            "session": a.get("session"),
            "year": a.get("year"),
        }
