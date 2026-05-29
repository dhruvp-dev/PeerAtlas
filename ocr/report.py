"""
utils/report.py
================
Generates processing_report.json summarising the entire pipeline run.

Includes per-PDF breakdown and aggregate statistics.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from core.orchestrator import PipelineResult
from utils.logger import get_logger

logger = get_logger("report")


class ReportGenerator:
    """Aggregates PipelineResult objects into a human-readable JSON report."""

    def __init__(self, output_root: Path) -> None:
        self.output_root = output_root

    def generate(self, results: list[PipelineResult]) -> Path:
        totals = {
            "processed":       sum(r.total_pages for r in results),
            "pdfsProcessed":   len(results),
            "papersDetected":  sum(r.papers_detected for r in results),
            "papersExported":  sum(r.papers_exported for r in results),
            "reviewRequired":  sum(r.papers_review_required for r in results),
            "papersFailed":    sum(r.papers_failed for r in results),
            "duplicates":      sum(r.duplicates_found for r in results),
        }

        # Confidence averages
        all_meta = [m for r in results for m in r.paper_records]
        totals["avgSubjectConfidence"] = self._avg(all_meta, "subjectConfidence")
        totals["avgBranchConfidence"]  = self._avg(all_meta, "branchConfidence")

        per_pdf = [
            {
                "sourcePdf":         str(r.source_pdf.name),
                "totalPages":        r.total_pages,
                "papersDetected":    r.papers_detected,
                "papersExported":    r.papers_exported,
                "reviewRequired":    r.papers_review_required,
                "papersFailed":      r.papers_failed,
                "duplicates":        r.duplicates_found,
                "errors":            r.errors,
            }
            for r in results
        ]

        report = {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "summary": totals,
            "perPdf": per_pdf,
        }

        report_path = self.output_root / "processing_report.json"
        report_path.write_text(
            json.dumps(report, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        logger.info(
            f"[REPORT] Summary → "
            f"PDFs={totals['pdfsProcessed']}, "
            f"Exported={totals['papersExported']}, "
            f"Review={totals['reviewRequired']}, "
            f"Failed={totals['papersFailed']}, "
            f"Dupes={totals['duplicates']}"
        )
        logger.info(f"[REPORT] Written to {report_path}")
        return report_path

    @staticmethod
    def _avg(records: list[dict], key: str) -> float:
        vals = [r[key] for r in records if isinstance(r.get(key), (int, float))]
        return round(sum(vals) / len(vals), 3) if vals else 0.0
