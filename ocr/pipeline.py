"""
PeerAtlas OCR Ingestion Pipeline
=================================
Production-quality academic paper extraction engine.

Usage:
    python pipeline.py --input path/to/archive.pdf --output ./output
    python pipeline.py --input ./pdf_folder/ --output ./output --workers 4
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from core.orchestrator import PipelineOrchestrator
from utils.logger import get_logger
from utils.report import ReportGenerator

logger = get_logger("pipeline")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="PeerAtlas — Academic Paper OCR Ingestion Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        required=True,
        help="Path to a PDF file or folder of PDFs",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=Path("./peeratlas_output"),
        help="Root output directory (default: ./peeratlas_output)",
    )
    parser.add_argument(
        "--workers", "-w",
        type=int,
        default=2,
        help="Number of parallel workers for multi-PDF batches (default: 2)",
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=300,
        help="DPI for PDF→image conversion (default: 300)",
    )
    parser.add_argument(
        "--lang",
        type=str,
        default="eng",
        help="Tesseract language code (default: eng)",
    )
    parser.add_argument(
        "--min-ocr-len",
        type=int,
        default=80,
        help="Minimum OCR text length per page to consider readable (default: 80)",
    )
    parser.add_argument(
        "--subject-confidence",
        type=float,
        default=0.75,
        help="Minimum confidence to accept a subject extraction (default: 0.75)",
    )
    parser.add_argument(
        "--branch-confidence",
        type=float,
        default=0.80,
        help="Minimum confidence to accept a branch extraction (default: 0.80)",
    )
    return parser.parse_args()


def collect_pdfs(input_path: Path) -> list[Path]:
    """Collect all PDF files from the given path (file or folder)."""
    if input_path.is_file():
        if input_path.suffix.lower() != ".pdf":
            logger.error(f"Input file is not a PDF: {input_path}")
            sys.exit(1)
        return [input_path]
    elif input_path.is_dir():
        pdfs = sorted(input_path.rglob("*.pdf"))
        if not pdfs:
            logger.error(f"No PDF files found in: {input_path}")
            sys.exit(1)
        logger.info(f"Found {len(pdfs)} PDF(s) in {input_path}")
        return pdfs
    else:
        logger.error(f"Input path does not exist: {input_path}")
        sys.exit(1)


def main() -> None:
    args = parse_args()
    start_time = time.time()

    logger.info("=" * 60)
    logger.info("PeerAtlas OCR Ingestion Pipeline — Starting")
    logger.info("=" * 60)
    logger.info(f"Input  : {args.input}")
    logger.info(f"Output : {args.output}")
    logger.info(f"Workers: {args.workers}")
    logger.info(f"DPI    : {args.dpi}")

    pdfs = collect_pdfs(args.input)

    config = {
        "dpi": args.dpi,
        "lang": args.lang,
        "min_ocr_len": args.min_ocr_len,
        "subject_confidence": args.subject_confidence,
        "branch_confidence": args.branch_confidence,
        "output_root": args.output,
    }

    orchestrator = PipelineOrchestrator(config)
    all_results = []

    if len(pdfs) == 1 or args.workers == 1:
        for pdf_path in pdfs:
            result = orchestrator.process_pdf(pdf_path)
            all_results.append(result)
    else:
        with ThreadPoolExecutor(max_workers=args.workers) as executor:
            futures = {executor.submit(orchestrator.process_pdf, p): p for p in pdfs}
            for future in as_completed(futures):
                pdf_path = futures[future]
                try:
                    result = future.result()
                    all_results.append(result)
                except Exception as exc:
                    logger.error(f"Unhandled exception for {pdf_path}: {exc}")

    # Generate final processing report
    reporter = ReportGenerator(args.output)
    reporter.generate(all_results)

    elapsed = time.time() - start_time
    logger.info("=" * 60)
    logger.info(f"Pipeline complete in {elapsed:.1f}s")
    logger.info(f"Results written to: {args.output}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
