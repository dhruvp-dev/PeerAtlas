"""
exporters/pdf_exporter.py
==========================
Stage 5: Export a paper group as a standalone PDF.

Output structure:
  <output_root>/
    <Branch>/
      Semester <N>/
        <Subject>/
          <Session>_<Year>.pdf

Uses pypdf (preferred) or PyPDF2 as fallback.
"""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from utils.logger import get_logger
from utils.slugify import slugify

logger = get_logger("pdf_exporter")

# ---------------------------------------------------------------------------
# Import PDF library
# ---------------------------------------------------------------------------
try:
    from pypdf import PdfReader, PdfWriter
    _PDF_LIB = "pypdf"
except ImportError:
    try:
        from PyPDF2 import PdfReader, PdfWriter  # type: ignore
        _PDF_LIB = "PyPDF2"
    except ImportError:
        PdfReader = None  # type: ignore
        PdfWriter = None  # type: ignore
        _PDF_LIB = None
        logger.warning("Neither pypdf nor PyPDF2 installed — PDF export disabled")


class PDFExporter:
    """Exports individual paper group pages as a new PDF file."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def export(
        self,
        source_pdf: Path,
        group: dict,
        metadata: dict,
        output_root: Path,
    ) -> Path | None:
        """
        Extract pages *start_page..end_page* from *source_pdf* and write a
        new PDF into the organised output tree.

        Returns the Path of the exported file, or None on failure.
        """
        if _PDF_LIB is None:
            logger.error("[PDF-EXPORT] No PDF library available — skipping")
            return None

        dest_dir = self._build_dest_dir(metadata, output_root)
        dest_dir.mkdir(parents=True, exist_ok=True)

        filename = self._build_filename(metadata)
        dest_path = dest_dir / filename

        # Resolve page numbers (pypdf uses 0-based indexing)
        start_idx = group["start_page"] - 1   # 0-based
        end_idx   = group["end_page"]          # exclusive upper bound (non-inclusive)

        try:
            reader = PdfReader(str(source_pdf))
            total = len(reader.pages)

            # Clamp to valid range
            start_idx = max(0, min(start_idx, total - 1))
            end_idx   = max(start_idx + 1, min(end_idx, total))

            writer = PdfWriter()
            for i in range(start_idx, end_idx):
                writer.add_page(reader.pages[i])

            with open(dest_path, "wb") as f:
                writer.write(f)

            logger.info(f"[PDF-EXPORT] Wrote {dest_path} ({end_idx - start_idx} page(s))")
            return dest_path

        except Exception as exc:
            logger.error(f"[PDF-EXPORT] Failed to export {filename}: {exc}")
            return None

    # ------------------------------------------------------------------

    def _build_dest_dir(self, metadata: dict, output_root: Path) -> Path:
        branch = metadata.get("branch") or "Unknown Branch"
        semester = metadata.get("semester")
        sem_label = f"Semester {semester}" if semester else "Unknown Semester"
        subject = metadata.get("subjectOriginal") or "Unknown Subject"

        return output_root / branch / sem_label / subject

    def _build_filename(self, metadata: dict) -> str:
        session = metadata.get("session") or "Unknown"
        year    = metadata.get("year") or "0000"
        return f"{session}_{year}.pdf"
