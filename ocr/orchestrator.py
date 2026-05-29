"""
core/orchestrator.py
====================
Central coordinator for the PeerAtlas ingestion pipeline.

Stages:
  1. PDF → page images  (pdf2image)
  2. Page images → OCR text  (pytesseract)
  3. OCR text → paper groups  (boundary detector)
  4. Paper groups → metadata  (extractors)
  5. Groups → exported PDFs  (pdf exporter)
  6. Metadata → Convex JSON  (convex exporter)
  7. Duplicate detection
  8. Review routing
"""

from __future__ import annotations

import traceback
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from core.ocr_engine import OCREngine
from core.boundary_detector import BoundaryDetector
from core.paper_grouper import PaperGrouper
from extractors.metadata_extractor import MetadataExtractor
from exporters.pdf_exporter import PDFExporter
from exporters.convex_exporter import ConvexExporter
from exporters.duplicate_detector import DuplicateDetector
from review.review_router import ReviewRouter
from utils.logger import get_logger

logger = get_logger("orchestrator")


@dataclass
class PipelineResult:
    """Aggregated result for one source PDF."""
    source_pdf: Path
    total_pages: int = 0
    papers_detected: int = 0
    papers_exported: int = 0
    papers_review_required: int = 0
    papers_failed: int = 0
    duplicates_found: int = 0
    errors: list[str] = field(default_factory=list)
    paper_records: list[dict[str, Any]] = field(default_factory=list)


class PipelineOrchestrator:
    """
    Drives the full ingestion pipeline for one or many source PDFs.
    Failures in individual papers are isolated; the batch continues.
    """

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.output_root = Path(config["output_root"])
        self.output_root.mkdir(parents=True, exist_ok=True)

        self.ocr_engine = OCREngine(config)
        self.boundary_detector = BoundaryDetector(config)
        self.paper_grouper = PaperGrouper(config)
        self.metadata_extractor = MetadataExtractor(config)
        self.pdf_exporter = PDFExporter(config)
        self.convex_exporter = ConvexExporter(config)
        self.duplicate_detector = DuplicateDetector(config)
        self.review_router = ReviewRouter(config)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process_pdf(self, pdf_path: Path) -> PipelineResult:
        result = PipelineResult(source_pdf=pdf_path)
        logger.info(f"{'='*50}")
        logger.info(f"[START] Processing: {pdf_path.name}")

        try:
            # Stage 1 + 2: Convert pages and OCR
            ocr_pages = self._stage_ocr(pdf_path, result)
            if not ocr_pages:
                return result

            # Stage 3: Detect boundaries & group pages into papers
            groups = self._stage_group(ocr_pages, result)
            if not groups:
                logger.warning(f"No paper groups found in {pdf_path.name}")
                return result

            result.papers_detected = len(groups)
            logger.info(f"[GROUPS] Detected {len(groups)} paper group(s)")

            # Stage 4–7: Per-paper processing
            all_metadata = []
            for group in groups:
                meta = self._process_paper_group(pdf_path, group, result)
                if meta:
                    all_metadata.append(meta)

            # Stage: Duplicate detection across all papers in this PDF
            dupes = self.duplicate_detector.detect(all_metadata)
            result.duplicates_found = len(dupes)
            if dupes:
                self.review_router.route_duplicates(dupes, self.output_root)

            # Stage: Convex export
            self.convex_exporter.export(all_metadata, self.output_root, pdf_path.stem)

            logger.info(
                f"[DONE] {pdf_path.name} — "
                f"exported={result.papers_exported}, "
                f"review={result.papers_review_required}, "
                f"failed={result.papers_failed}, "
                f"dupes={result.duplicates_found}"
            )

        except Exception as exc:
            msg = f"Fatal error processing {pdf_path.name}: {exc}"
            logger.error(msg)
            logger.debug(traceback.format_exc())
            result.errors.append(msg)
            self.review_router.route_failed_pdf(pdf_path, str(exc), self.output_root)

        return result

    # ------------------------------------------------------------------
    # Internal stages
    # ------------------------------------------------------------------

    def _stage_ocr(self, pdf_path: Path, result: PipelineResult) -> list[dict]:
        """Convert PDF → images → OCR text. Returns list of page dicts."""
        logger.info("[STAGE 1+2] OCR conversion")
        try:
            ocr_pages = self.ocr_engine.process_pdf(pdf_path)
            result.total_pages = len(ocr_pages)
            logger.info(f"[OCR] {len(ocr_pages)} page(s) processed")
            return ocr_pages
        except Exception as exc:
            msg = f"OCR stage failed: {exc}"
            logger.error(msg)
            result.errors.append(msg)
            result.papers_failed += 1
            self.review_router.route_failed_pdf(pdf_path, msg, self.output_root)
            return []

    def _stage_group(self, ocr_pages: list[dict], result: PipelineResult) -> list[dict]:
        """Detect boundaries and group pages into paper chunks."""
        logger.info("[STAGE 3] Paper boundary detection + grouping")
        try:
            boundaries = self.boundary_detector.detect(ocr_pages)
            groups = self.paper_grouper.group(ocr_pages, boundaries)
            return groups
        except Exception as exc:
            msg = f"Grouping stage failed: {exc}"
            logger.error(msg)
            result.errors.append(msg)
            return []

    def _process_paper_group(
        self,
        source_pdf: Path,
        group: dict,
        result: PipelineResult,
    ) -> dict | None:
        """Run metadata extraction, export, and review routing for one group."""
        page_range = f"pages {group['start_page']}–{group['end_page']}"
        try:
            # Stage 4: Extract metadata
            metadata = self.metadata_extractor.extract(group)
            metadata["sourcePdf"] = source_pdf.name
            result.paper_records.append(metadata)

            # Determine confidence gate
            low_confidence = self._is_low_confidence(metadata)

            if low_confidence:
                logger.warning(
                    f"[REVIEW] Low confidence — {page_range} — "
                    f"subject='{metadata.get('subjectOriginal', '?')}'"
                )
                self.review_router.route_paper(
                    source_pdf, group, metadata, self.output_root
                )
                result.papers_review_required += 1
                return metadata  # still include in convex export with flag

            # Stage 5: Export individual PDF
            exported_path = self.pdf_exporter.export(
                source_pdf, group, metadata, self.output_root
            )
            if exported_path:
                metadata["exportedPath"] = str(exported_path)
                result.papers_exported += 1
                logger.info(
                    f"[EXPORT] {exported_path.name} ({page_range})"
                )
            else:
                result.papers_failed += 1

            return metadata

        except Exception as exc:
            msg = f"Paper processing failed ({page_range}): {exc}"
            logger.error(msg)
            logger.debug(traceback.format_exc())
            result.errors.append(msg)
            result.papers_failed += 1

            # Attempt graceful review routing even after exception
            try:
                self.review_router.route_failed_group(
                    source_pdf, group, str(exc), self.output_root
                )
            except Exception:
                pass
            return None

    def _is_low_confidence(self, metadata: dict) -> bool:
        """Return True if any critical field falls below its confidence threshold."""
        thresholds = {
            "subjectConfidence": self.config.get("subject_confidence", 0.75),
            "branchConfidence": self.config.get("branch_confidence", 0.80),
        }
        for key, threshold in thresholds.items():
            val = metadata.get(key, 0.0)
            if isinstance(val, (int, float)) and val < threshold:
                return True
        if metadata.get("partialPaper"):
            return True
        return False
