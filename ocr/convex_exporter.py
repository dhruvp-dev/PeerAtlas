"""
exporters/convex_exporter.py
=============================
Stage 6: Generate structured JSON records optimised for the Convex database.

Writes two files:
  <output_root>/convex/papers.json          ← all papers from this batch
  <output_root>/convex/papers_<stem>.json   ← per-source-PDF snapshot

Each record is a flat, searchable Convex document with:
  - normalised fields (slugs, integers)
  - dynamic keyword array for full-text search
  - full searchableText for vector/semantic search
  - confidence scores retained for quality filtering
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from utils.logger import get_logger

logger = get_logger("convex_exporter")

# Fields to EXCLUDE from the Convex export (too large / internal only)
_EXCLUDE_FIELDS = {"searchableText", "ocrPreview"}  # kept in separate searchable index

# Maximum searchable text length stored inline (truncated; full text stored separately)
_MAX_INLINE_TEXT = 2000


def _convex_record(metadata: dict) -> dict:
    """
    Transform an internal metadata dict into a Convex-ready flat document.
    Strips oversized fields; adds computed helpers.
    """
    record: dict[str, Any] = {}

    for key, value in metadata.items():
        if key in _EXCLUDE_FIELDS:
            continue
        if key == "pages":  # full page objects not needed in Convex
            continue
        record[key] = value

    # Truncate searchable text inline; store flag for full-text lookup
    full_text = metadata.get("searchableText", "")
    record["searchableTextPreview"] = full_text[:_MAX_INLINE_TEXT]
    record["hasFullText"] = len(full_text) > _MAX_INLINE_TEXT

    # Add ingestion timestamp
    record["ingestedAt"] = datetime.now(timezone.utc).isoformat()

    # Ensure review flag present
    record.setdefault("requiresReview", False)

    return record


class ConvexExporter:
    """Serialises metadata records as Convex-compatible JSON."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config

    def export(
        self,
        all_metadata: list[dict],
        output_root: Path,
        source_stem: str,
    ) -> None:
        """
        Write per-source and cumulative JSON exports.
        Appends to cumulative file if it already exists.
        """
        convex_dir = output_root / "convex"
        convex_dir.mkdir(parents=True, exist_ok=True)

        records = [_convex_record(m) for m in all_metadata]

        # Per-source file
        source_file = convex_dir / f"papers_{source_stem}.json"
        self._write_json(source_file, records)
        logger.info(f"[CONVEX] Wrote {len(records)} record(s) → {source_file.name}")

        # Cumulative file (append)
        cumulative_file = convex_dir / "papers.json"
        existing = self._read_json(cumulative_file)
        merged = existing + records
        self._write_json(cumulative_file, merged)
        logger.info(f"[CONVEX] Cumulative total: {len(merged)} record(s)")

        # Also write searchable full-text separately
        self._export_full_text(all_metadata, convex_dir, source_stem)

    # ------------------------------------------------------------------

    def _export_full_text(
        self,
        all_metadata: list[dict],
        convex_dir: Path,
        source_stem: str,
    ) -> None:
        """
        Write a separate file with full OCR text per paper.
        Referenced by textHash for vector search ingestion.
        """
        text_dir = convex_dir / "full_text"
        text_dir.mkdir(parents=True, exist_ok=True)

        for m in all_metadata:
            text_hash = m.get("textHash", "unknown")
            full_text = m.get("searchableText", "")
            if full_text:
                (text_dir / f"{text_hash}.txt").write_text(
                    full_text, encoding="utf-8"
                )

    @staticmethod
    def _write_json(path: Path, data: list) -> None:
        path.write_text(
            json.dumps(data, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )

    @staticmethod
    def _read_json(path: Path) -> list:
        if path.exists():
            try:
                return json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                logger.warning(f"[CONVEX] Could not parse existing {path.name} — starting fresh")
        return []
