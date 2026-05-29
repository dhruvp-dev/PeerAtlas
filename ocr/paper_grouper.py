"""
core/paper_grouper.py
======================
Stage 3b: Given a list of OCR pages and boundary page numbers,
group consecutive pages into paper objects.

Each group dict:
  {
    "start_page": int,
    "end_page": int,
    "pages": list[dict],          # full OCR page dicts
    "combined_text": str,         # concatenated clean text
    "header_text": str,           # text of the boundary page (richest metadata)
    "partial_paper": bool,        # True if first page lacks strong metadata
  }
"""

from __future__ import annotations

from typing import Any

from utils.logger import get_logger

logger = get_logger("paper_grouper")


class PaperGrouper:
    """
    Splits OCR pages into paper groups based on detected boundaries.
    """

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def group(self, ocr_pages: list[dict], boundaries: list[int]) -> list[dict]:
        """
        Build a list of paper group dicts.

        *boundaries* is a sorted list of 1-based page numbers where
        new papers start.  Every page between boundary[i] and
        boundary[i+1]-1 (inclusive) belongs to paper i.
        """
        if not ocr_pages:
            return []

        boundary_set = set(boundaries)
        sorted_boundaries = sorted(boundary_set)

        # Build index: page_number → page dict
        page_map = {p["page_number"]: p for p in ocr_pages}
        all_page_numbers = sorted(page_map.keys())

        groups: list[dict] = []

        for b_idx, start_pn in enumerate(sorted_boundaries):
            # Determine end page
            if b_idx + 1 < len(sorted_boundaries):
                end_pn = sorted_boundaries[b_idx + 1] - 1
            else:
                end_pn = all_page_numbers[-1]

            group_pages = [
                page_map[pn]
                for pn in range(start_pn, end_pn + 1)
                if pn in page_map
            ]

            if not group_pages:
                logger.warning(f"[GROUPER] Empty group for start_page={start_pn}, skipping")
                continue

            combined_text = "\n\n".join(p["clean_text"] for p in group_pages)
            header_text = group_pages[0]["clean_text"]

            # Partial paper: boundary page has no "SUBJECT:" signal
            is_partial = "subject_line" not in group_pages[0].get("boundary_signals", [])

            group = {
                "start_page": start_pn,
                "end_page": end_pn,
                "page_count": end_pn - start_pn + 1,
                "pages": group_pages,
                "combined_text": combined_text,
                "header_text": header_text,
                "partial_paper": is_partial,
            }

            groups.append(group)
            logger.info(
                f"[GROUPER] Group {len(groups)}: pages {start_pn}–{end_pn} "
                f"({end_pn - start_pn + 1} page(s)"
                f"{', PARTIAL' if is_partial else ''})"
            )

        return groups
