"""
core/ocr_engine.py
==================
Stage 1 + 2: Convert PDF pages to images, then extract OCR text.

Returns a list of page dicts:
  {
    "page_number": int,          # 1-based
    "raw_text": str,             # raw pytesseract output
    "clean_text": str,           # whitespace-normalised text
    "lines": list[str],          # non-empty lines
    "ocr_confidence": float,     # 0.0–1.0 based on text length heuristic
    "is_readable": bool,         # passes minimum length check
  }
"""

from __future__ import annotations

import io
import traceback
from pathlib import Path
from typing import Any

from utils.logger import get_logger

logger = get_logger("ocr_engine")

# ---------------------------------------------------------------------------
# Optional heavy imports — degrade gracefully for testing without Tesseract
# ---------------------------------------------------------------------------
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract / Pillow not installed — OCR disabled (test mode)")

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logger.warning("pdf2image not installed — page conversion disabled (test mode)")


class OCREngine:
    """
    Converts a PDF into a list of OCR-processed page dicts.
    Each page is processed independently so a single bad page never
    halts the entire document.
    """

    def __init__(self, config: dict[str, Any]) -> None:
        self.dpi = config.get("dpi", 300)
        self.lang = config.get("lang", "eng")
        self.min_ocr_len = config.get("min_ocr_len", 80)

    # ------------------------------------------------------------------
    # Public
    # ------------------------------------------------------------------

    def process_pdf(self, pdf_path: Path) -> list[dict]:
        """
        Convert all pages in *pdf_path* to OCR page dicts.
        Returns an empty list only on total conversion failure.
        """
        logger.info(f"[OCR] Converting PDF → images: {pdf_path.name}")
        images = self._pdf_to_images(pdf_path)
        if not images:
            raise RuntimeError(f"pdf2image returned 0 pages for {pdf_path.name}")

        logger.info(f"[OCR] {len(images)} page image(s) ready, running Tesseract …")
        pages = []
        for idx, image in enumerate(images, start=1):
            page = self._ocr_page(image, idx)
            pages.append(page)
            if not page["is_readable"]:
                logger.warning(
                    f"[OCR] Page {idx} has low readability "
                    f"(len={len(page['clean_text'])})"
                )
            else:
                logger.debug(f"[OCR] Page {idx} OK (len={len(page['clean_text'])})")

        return pages

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _pdf_to_images(self, pdf_path: Path) -> list:
        """
        Use pdf2image to render each page to a PIL Image.
        Falls back to an empty list on failure (caller raises).
        """
        if not PDF2IMAGE_AVAILABLE:
            logger.error("pdf2image not available — cannot convert PDF")
            return []
        try:
            images = convert_from_path(
                str(pdf_path),
                dpi=self.dpi,
                fmt="jpeg",
                thread_count=2,
            )
            return images
        except Exception as exc:
            logger.error(f"[OCR] pdf2image failed for {pdf_path.name}: {exc}")
            logger.debug(traceback.format_exc())
            raise RuntimeError(f"pdf2image conversion failed: {exc}") from exc

    def _ocr_page(self, image: Any, page_number: int) -> dict:
        """
        Run Tesseract on a single PIL Image and build a page dict.
        If Tesseract crashes, the page is marked unreadable but returned.
        """
        raw_text = ""
        try:
            if TESSERACT_AVAILABLE:
                # Preprocess: convert to greyscale for better OCR accuracy
                grey = image.convert("L")
                raw_text = pytesseract.image_to_string(grey, lang=self.lang)
            else:
                # Test/stub mode — no real OCR
                raw_text = f"[STUB PAGE {page_number}]"
        except Exception as exc:
            logger.error(f"[OCR] Tesseract failed on page {page_number}: {exc}")
            logger.debug(traceback.format_exc())

        clean_text = self._clean(raw_text)
        lines = [ln for ln in clean_text.splitlines() if ln.strip()]
        is_readable = len(clean_text.strip()) >= self.min_ocr_len

        # Simple confidence heuristic: penalise very short or empty pages
        confidence = min(1.0, len(clean_text.strip()) / max(self.min_ocr_len * 3, 1))

        return {
            "page_number": page_number,
            "raw_text": raw_text,
            "clean_text": clean_text,
            "lines": lines,
            "ocr_confidence": round(confidence, 3),
            "is_readable": is_readable,
        }

    @staticmethod
    def _clean(text: str) -> str:
        """Normalise whitespace; strip control characters."""
        import re
        # Collapse multiple blank lines to one
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Strip trailing whitespace from each line
        lines = [ln.rstrip() for ln in text.splitlines()]
        return "\n".join(lines).strip()
