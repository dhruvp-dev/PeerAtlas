# PeerAtlas OCR Ingestion Pipeline

A production-quality academic paper extraction engine for the **PeerAtlas** platform.

Processes large bundled university PDF archives and automatically splits them into
individual, searchable, subject-wise papers — ready for the Convex database.
u
---

## Features

| Capability | Detail |
|---|---|
| **Paper boundary detection** | Detects `SUBJECT:` headers, degree blocks, semester lines |
| **Multi-page grouping** | Groups consecutive pages into one paper (not 1 page = 1 paper) |
| **Branch normalisation** | Regex + fuzzy matching with alias table; 8+ branches supported |
| **Semester extraction** | Handles Roman numerals, spacing variants, B.Tech patterns |
| **Subject extraction** | Dynamic — no hardcoded list; parsed directly from `SUBJECT:` line |
| **Session / year extraction** | Summer / Winter + year; month-name heuristics as fallback |
| **PDF export** | Per-paper PDFs in `Branch/Semester N/Subject/Session_Year.pdf` tree |
| **Convex export** | Flat JSON with slugs, keywords, searchable text, confidence scores |
| **Duplicate detection** | SHA-256 exact + OCR similarity (rapidfuzz) + metadata comparison |
| **Review routing** | Low-confidence papers → `review_required/`; crashes → `failed_processing/` |
| **Fault tolerance** | One bad paper never stops the batch; all failures are isolated and logged |
| **Parallel processing** | `--workers N` for multi-PDF batches via `ThreadPoolExecutor` |

---

## Quick Start

### 1. System dependencies

```bash
# Ubuntu / Debian
sudo apt install tesseract-ocr poppler-utils

# macOS
brew install tesseract poppler
```

### 2. Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the pipeline

```bash
# Single PDF
python pipeline.py --input "2025 Summer Question Paper.pdf" --output ./output

# Folder of PDFs, 4 parallel workers
python pipeline.py --input ./pdf_archive/ --output ./output --workers 4

# Custom DPI and confidence thresholds
python pipeline.py \
  --input archive.pdf \
  --output ./output \
  --dpi 400 \
  --subject-confidence 0.70 \
  --branch-confidence 0.75
```

---

## Output Structure

```
output/
├── Artificial Intelligence and Machine Learning/
│   └── Semester 5/
│       ├── Machine Learning/
│       │   └── Summer_2025.pdf
│       └── Database Management Systems/
│           └── Summer_2025.pdf
│
├── convex/
│   ├── papers.json                  ← all records (append-friendly)
│   ├── papers_archive_name.json     ← per-source snapshot
│   └── full_text/
│       └── <sha256>.txt             ← full OCR text per paper
│
├── review_required/
│   ├── archive__pages_7-9.pdf
│   └── ...
│
├── failed_processing/
│   └── corrupted.pdf
│
├── duplicate_review/
│
├── review_required.json
├── failed_files.json
├── duplicates.json
├── processing_report.json
└── peeratlas_run.log
```

---

## Convex Record Format

```json
{
  "branch": "Artificial Intelligence and Machine Learning",
  "branchSlug": "artificial-intelligence-and-machine-learning",
  "branchConfidence": 0.95,

  "semester": 5,
  "semesterConfidence": 0.95,

  "subjectOriginal": "Machine Learning",
  "subjectSlug": "machine-learning",
  "subjectConfidence": 0.95,

  "year": 2025,
  "session": "Summer",
  "sessionConfidence": 0.95,

  "startPage": 1,
  "endPage": 3,
  "pageCount": 3,
  "partialPaper": false,

  "keywords": [
    "machine learning",
    "machine-learning",
    "artificial intelligence and machine learning",
    "aiml",
    "semester 5",
    "sem 5",
    "summer 2025",
    "2025"
  ],

  "textHash": "sha256hexdigest...",
  "searchableTextPreview": "first 2000 chars of OCR...",
  "hasFullText": true,

  "requiresReview": false,
  "reviewIssues": [],

  "exportedPath": "Artificial Intelligence.../Summer_2025.pdf",
  "ingestedAt": "2025-06-01T12:00:00+00:00"
}
```

---

## Architecture

```
pipeline.py  (entry point + arg parsing)
│
└── core/
    ├── orchestrator.py       ← drives all stages; fault isolation per paper
    ├── ocr_engine.py         ← pdf2image + pytesseract; per-page OCR
    ├── boundary_detector.py  ← scores pages for new-paper signals
    └── paper_grouper.py      ← groups consecutive pages into paper dicts
│
├── extractors/
│   ├── metadata_extractor.py ← orchestrates sub-extractors
│   ├── branch_extractor.py   ← regex + fuzzy alias matching
│   ├── semester_extractor.py ← Roman numerals + variant patterns
│   ├── subject_extractor.py  ← dynamic extraction from SUBJECT: line
│   └── session_extractor.py  ← Summer/Winter + year
│
├── exporters/
│   ├── pdf_exporter.py       ← writes Branch/Semester/Subject/Session_Year.pdf
│   ├── convex_exporter.py    ← writes flat JSON + full-text files
│   └── duplicate_detector.py ← SHA-256 + OCR similarity + metadata match
│
├── review/
│   └── review_router.py      ← routes failures to review/failed/duplicate dirs
│
└── utils/
    ├── logger.py             ← coloured console + rotating file log
    ├── slugify.py            ← URL-safe slug generation
    └── report.py             ← processing_report.json
```

---

## Metadata Extraction — Layered Fallback

Every field uses a 5-level fallback strategy. No single point of failure:

```
1. Structured regex on header text           (confidence ~0.95)
2. Regex on full combined OCR text           (confidence ~0.85)
3. Fuzzy matching (rapidfuzz) on aliases     (confidence 0.70–0.85)
4. Month-name / title heuristics             (confidence ~0.55)
5. Source filename parsing                   (confidence ~0.40)
```

---

## Review System

Papers are automatically flagged for review when:
- Subject confidence < 75%
- Branch confidence < 80%
- Semester missing
- Session missing
- Partial paper detected (no SUBJECT: on first page of group)

Duplicates are *never* deleted automatically — both copies go to `duplicate_review/`.

---

## Running Tests

```bash
python -m pytest tests/ -v
# 40 tests — no Tesseract or pdf2image required
```

---

## CLI Reference

| Flag | Default | Description |
|---|---|---|
| `--input` / `-i` | *(required)* | PDF file or folder |
| `--output` / `-o` | `./peeratlas_output` | Root output directory |
| `--workers` / `-w` | `2` | Parallel workers (multi-PDF) |
| `--dpi` | `300` | PDF→image DPI |
| `--lang` | `eng` | Tesseract language code |
| `--min-ocr-len` | `80` | Min OCR chars/page to consider readable |
| `--subject-confidence` | `0.75` | Threshold below which paper → review |
| `--branch-confidence` | `0.80` | Threshold below which paper → review |
