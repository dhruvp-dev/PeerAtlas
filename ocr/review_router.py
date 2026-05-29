"""
review/review_router.py
========================
Routes problematic papers to the appropriate review folder.

Folders:
  <output_root>/review_required/   ← low-confidence extractions
  <output_root>/failed_processing/ ← crash / unreadable papers
  <output_root>/duplicate_review/  ← duplicate pairs for human decision

Also maintains:
  review_required.json
  failed_files.json
  duplicates.json
"""

from __future__ import annotations

import json
import shutil
import traceback
from pathlib import Path
from typing import Any

from utils.logger import get_logger

logger = get_logger("review_router")


def _append_json(path: Path, record: dict) -> None:
    """Append a record to a JSON array file (creates if missing)."""
    existing: list = []
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []
    existing.append(record)
    path.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8",
    )


class ReviewRouter:
    """Handles isolation and logging of papers that need human attention."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    # ------------------------------------------------------------------
    # Low-confidence papers
    # ------------------------------------------------------------------

    def route_paper(
        self,
        source_pdf: Path,
        group: dict,
        metadata: dict,
        output_root: Path,
    ) -> None:
        """Route a low-confidence paper group to review_required/."""
        review_dir = output_root / "review_required"
        review_dir.mkdir(parents=True, exist_ok=True)

        # Build a safe filename
        page_tag = f"pages_{group['start_page']}-{group['end_page']}"
        dest_name = f"{source_pdf.stem}__{page_tag}.pdf"

        # Attempt to copy the page range as PDF
        try:
            self._copy_page_range(source_pdf, group, review_dir / dest_name)
        except Exception:
            logger.debug(traceback.format_exc())

        # Determine which issues triggered the review
        issues = self._collect_issues(metadata, group)
        metadata["requiresReview"] = True
        metadata["reviewIssues"] = issues

        record = {
            "file": dest_name,
            "sourcePdf": source_pdf.name,
            "startPage": group["start_page"],
            "endPage": group["end_page"],
            "issues": issues,
            "probableSubject": metadata.get("subjectOriginal"),
            "subjectConfidence": metadata.get("subjectConfidence", 0.0),
            "branchConfidence": metadata.get("branchConfidence", 0.0),
            "ocrPreview": group["header_text"][:300],
        }
        _append_json(output_root / "review_required.json", record)
        logger.info(f"[REVIEW] Routed {dest_name} → review_required/ (issues: {issues})")

    # ------------------------------------------------------------------
    # Failed PDFs
    # ------------------------------------------------------------------

    def route_failed_pdf(self, pdf_path: Path, error: str, output_root: Path) -> None:
        """Move a completely unprocessable PDF to failed_processing/."""
        failed_dir = output_root / "failed_processing"
        failed_dir.mkdir(parents=True, exist_ok=True)
        dest = failed_dir / pdf_path.name

        try:
            shutil.copy2(pdf_path, dest)
        except Exception:
            pass  # Best-effort copy

        record = {
            "file": pdf_path.name,
            "error": error,
            "stage": "orchestrator",
        }
        _append_json(output_root / "failed_files.json", record)
        logger.error(f"[FAILED] {pdf_path.name} → failed_processing/: {error}")

    def route_failed_group(
        self,
        source_pdf: Path,
        group: dict,
        error: str,
        output_root: Path,
    ) -> None:
        """Log a failed paper group (page range) without copying the PDF."""
        page_tag = f"pages_{group['start_page']}-{group['end_page']}"
        record = {
            "file": f"{source_pdf.stem}__{page_tag}",
            "sourcePdf": source_pdf.name,
            "error": error,
            "stage": "paper_processing",
            "startPage": group["start_page"],
            "endPage": group["end_page"],
        }
        _append_json(output_root / "failed_files.json", record)

    # ------------------------------------------------------------------
    # Duplicates
    # ------------------------------------------------------------------

    def route_duplicates(self, duplicate_pairs: list[dict], output_root: Path) -> None:
        """Write duplicate pair metadata to duplicate_review/."""
        dup_dir = output_root / "duplicate_review"
        dup_dir.mkdir(parents=True, exist_ok=True)

        dup_log = output_root / "duplicates.json"
        for pair in duplicate_pairs:
            _append_json(dup_log, pair)

        logger.info(f"[DUPE] {len(duplicate_pairs)} pair(s) logged → {dup_log.name}")

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _collect_issues(metadata: dict, group: dict) -> list[str]:
        issues: list[str] = []
        if not metadata.get("subjectOriginal"):
            issues.append("subject_not_detected")
        elif (metadata.get("subjectConfidence") or 0) < 0.75:
            issues.append("low_subject_confidence")
        if not metadata.get("branch"):
            issues.append("branch_not_detected")
        elif (metadata.get("branchConfidence") or 0) < 0.80:
            issues.append("low_branch_confidence")
        if not metadata.get("semester"):
            issues.append("semester_not_detected")
        if not metadata.get("session"):
            issues.append("session_not_detected")
        if group.get("partial_paper"):
            issues.append("partial_paper")
        return issues or ["low_overall_confidence"]

    @staticmethod
    def _copy_page_range(source_pdf: Path, group: dict, dest: Path) -> None:
        """Copy the relevant page range to *dest* as a new PDF."""
        try:
            from pypdf import PdfReader, PdfWriter
        except ImportError:
            try:
                from PyPDF2 import PdfReader, PdfWriter  # type: ignore
            except ImportError:
                return  # No PDF library — skip copy

        reader = PdfReader(str(source_pdf))
        writer = PdfWriter()
        start = max(0, group["start_page"] - 1)
        end   = min(len(reader.pages), group["end_page"])
        for i in range(start, end):
            writer.add_page(reader.pages[i])
        with open(dest, "wb") as f:
            writer.write(f)
