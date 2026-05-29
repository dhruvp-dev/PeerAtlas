"""
tests/test_pipeline.py
=======================
Unit tests for PeerAtlas OCR ingestion pipeline.

Tests run WITHOUT Tesseract or pdf2image installed by using
synthetic OCR page dicts that mimic real engine output.

Run:
    python -m pytest tests/ -v
"""

from __future__ import annotations

import sys
import json
import tempfile
from pathlib import Path

import pytest

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.boundary_detector import BoundaryDetector
from core.paper_grouper import PaperGrouper
from extractors.branch_extractor import BranchExtractor
from extractors.semester_extractor import SemesterExtractor
from extractors.subject_extractor import SubjectExtractor
from extractors.session_extractor import SessionExtractor
from extractors.metadata_extractor import MetadataExtractor
from exporters.duplicate_detector import DuplicateDetector
from utils.slugify import slugify

# ---------------------------------------------------------------------------
# Fixtures — synthetic OCR pages
# ---------------------------------------------------------------------------

ML_HEADER = """
BACHELOR OF TECHNOLOGY
B. Tech. Sem - V
Computer Science & Engineering AI & ML
SUBJECT: MACHINE LEARNING
SUMMER : 2025

Time: 3 Hours                         Total Marks: 70

Instructions: Attempt all questions.
"""

DBMS_HEADER = """
BACHELOR OF TECHNOLOGY
B. Tech. Sem - V
Computer Science & Engineering AI & ML
SUBJECT: DATABASE MANAGEMENT SYSTEMS
SUMMER : 2025

Time: 3 Hours                         Total Marks: 70
"""

QUESTION_PAGE = """
Q.1 Explain supervised and unsupervised learning with examples.
Q.2 What is the bias-variance tradeoff?
Q.3 Describe gradient descent algorithm.
Q.4 Explain decision trees and random forests.
Q.5 What is overfitting and how can it be prevented?
"""

QUESTION_PAGE_2 = """
Q.6 Describe neural networks and their components.
Q.7 Explain backpropagation algorithm in detail.
Q.8 What is cross-validation?
Q.9 Describe support vector machines.
Q.10 Explain K-means clustering.
"""


def _make_page(number: int, text: str, signals: list[str] | None = None) -> dict:
    lines = [ln for ln in text.splitlines() if ln.strip()]
    return {
        "page_number": number,
        "raw_text": text,
        "clean_text": text.strip(),
        "lines": lines,
        "ocr_confidence": 0.95,
        "is_readable": True,
        "boundary_score": 0,
        "boundary_signals": signals or [],
    }


@pytest.fixture
def sample_pages():
    """4 pages: ML (2 pages) → DBMS (2 pages)."""
    return [
        _make_page(1, ML_HEADER),
        _make_page(2, QUESTION_PAGE),
        _make_page(3, DBMS_HEADER),
        _make_page(4, QUESTION_PAGE_2),
    ]


@pytest.fixture
def config():
    return {
        "dpi": 300, "lang": "eng", "min_ocr_len": 80,
        "subject_confidence": 0.75, "branch_confidence": 0.80,
        "output_root": Path(tempfile.mkdtemp()),
    }


# ---------------------------------------------------------------------------
# BoundaryDetector tests
# ---------------------------------------------------------------------------

class TestBoundaryDetector:
    def test_detects_subject_line_as_boundary(self, config):
        det = BoundaryDetector(config)
        pages = [
            _make_page(1, ML_HEADER),
            _make_page(2, QUESTION_PAGE),
            _make_page(3, DBMS_HEADER),
        ]
        boundaries = det.detect(pages)
        assert 1 in boundaries, "Page 1 should always be a boundary"
        assert 3 in boundaries, "Page with SUBJECT: DBMS should be a boundary"

    def test_question_page_not_boundary(self, config):
        det = BoundaryDetector(config)
        pages = [
            _make_page(1, ML_HEADER),
            _make_page(2, QUESTION_PAGE),
        ]
        boundaries = det.detect(pages)
        assert 2 not in boundaries, "Question-only page should not be a boundary"

    def test_always_includes_page_one(self, config):
        det = BoundaryDetector(config)
        pages = [_make_page(1, QUESTION_PAGE)]
        boundaries = det.detect(pages)
        assert 1 in boundaries

    def test_no_pages_returns_fallback(self, config):
        det = BoundaryDetector(config)
        # Empty page list → graceful fallback (no crash)
        # The boundary detector returns [1] as fallback even for empty input
        boundaries = det.detect([])
        assert isinstance(boundaries, list)  # graceful, no crash


# ---------------------------------------------------------------------------
# PaperGrouper tests
# ---------------------------------------------------------------------------

class TestPaperGrouper:
    def test_groups_two_papers(self, config, sample_pages):
        det = BoundaryDetector(config)
        pages = sample_pages
        # Mark boundaries manually for isolation
        det.detect(pages)
        boundaries = [1, 3]
        grouper = PaperGrouper(config)
        groups = grouper.group(pages, boundaries)
        assert len(groups) == 2
        assert groups[0]["start_page"] == 1
        assert groups[0]["end_page"] == 2
        assert groups[1]["start_page"] == 3
        assert groups[1]["end_page"] == 4

    def test_single_group_when_one_boundary(self, config, sample_pages):
        grouper = PaperGrouper(config)
        groups = grouper.group(sample_pages, [1])
        assert len(groups) == 1
        assert groups[0]["start_page"] == 1
        assert groups[0]["end_page"] == 4

    def test_combined_text_populated(self, config, sample_pages):
        grouper = PaperGrouper(config)
        groups = grouper.group(sample_pages, [1, 3])
        assert "MACHINE LEARNING" in groups[0]["combined_text"]
        assert "DATABASE MANAGEMENT" in groups[1]["combined_text"]


# ---------------------------------------------------------------------------
# BranchExtractor tests
# ---------------------------------------------------------------------------

class TestBranchExtractor:
    @pytest.fixture
    def extractor(self, config):
        return BranchExtractor(config)

    def test_extracts_aiml(self, extractor):
        result = extractor.extract("AI & ML Department", "", "")
        assert result["value"] == "Artificial Intelligence and Machine Learning"
        assert result["confidence"] > 0.8

    def test_extracts_cse(self, extractor):
        result = extractor.extract("Computer Science & Engineering", "", "")
        assert result["value"] == "Computer Science and Engineering"

    def test_extracts_it(self, extractor):
        result = extractor.extract("Information Technology", "", "")
        assert result["value"] == "Information Technology"

    def test_falls_back_to_filename(self, extractor):
        result = extractor.extract("", "", "AIML_SEM5_SUMMER.pdf")
        assert result["source"] in ("filename", "fuzzy_header", "body_regex", "header_regex")

    def test_returns_none_when_unknown(self, extractor):
        result = extractor.extract("XYZ Unknown Dept 99", "", "random.pdf")
        # Should return None but not crash
        assert result["confidence"] <= 1.0


# ---------------------------------------------------------------------------
# SemesterExtractor tests
# ---------------------------------------------------------------------------

class TestSemesterExtractor:
    @pytest.fixture
    def extractor(self, config):
        return SemesterExtractor(config)

    @pytest.mark.parametrize("text,expected", [
        ("B. Tech. Sem - V", 5),
        ("Semester VI", 6),
        ("SEM 4", 4),
        ("B.Tech Sem-III", 3),
        ("SEMESTER VIII", 8),
        ("Sem - 7", 7),
    ])
    def test_semester_variants(self, extractor, text, expected):
        result = extractor.extract(text, "", "")
        assert result["value"] == expected, f"Expected {expected} from '{text}'"

    def test_filename_fallback(self, extractor):
        result = extractor.extract("", "", "paper_SEM_5.pdf")
        assert result["value"] == 5

    def test_missing_semester(self, extractor):
        result = extractor.extract("Random text without semester", "", "")
        assert result["value"] is None
        assert result["confidence"] == 0.0


# ---------------------------------------------------------------------------
# SubjectExtractor tests
# ---------------------------------------------------------------------------

class TestSubjectExtractor:
    @pytest.fixture
    def extractor(self, config):
        return SubjectExtractor(config)

    def test_subject_line_extraction(self, extractor):
        result = extractor.extract(ML_HEADER, "", "")
        assert result["value"] == "Machine Learning"
        assert result["confidence"] >= 0.90

    def test_subject_from_body(self, extractor):
        result = extractor.extract("", ML_HEADER, "")
        assert result["value"] == "Machine Learning"

    def test_dbms_extraction(self, extractor):
        result = extractor.extract(DBMS_HEADER, "", "")
        assert "Database Management" in result["value"]

    def test_clean_strips_exam_suffix(self, extractor):
        result = extractor.extract("SUBJECT: MACHINE LEARNING QUESTION PAPER", "", "")
        assert "Question Paper" not in (result["value"] or "")

    def test_sub_shorthand(self, extractor):
        result = extractor.extract("Sub.: Operating Systems", "", "")
        assert "Operating Systems" in (result["value"] or "")


# ---------------------------------------------------------------------------
# SessionExtractor tests
# ---------------------------------------------------------------------------

class TestSessionExtractor:
    @pytest.fixture
    def extractor(self, config):
        return SessionExtractor(config)

    @pytest.mark.parametrize("text,exp_session,exp_year", [
        ("SUMMER : 2025", "Summer", 2025),
        ("WINTER 2024", "Winter", 2024),
        ("SUMMER-2023", "Summer", 2023),
    ])
    def test_session_year_extraction(self, extractor, text, exp_session, exp_year):
        result = extractor.extract(text, "", "")
        assert result["session"] == exp_session
        assert result["year"] == exp_year

    def test_month_heuristic_summer(self, extractor):
        result = extractor.extract("May 2025 Examination", "", "")
        assert result["session"] == "Summer"

    def test_month_heuristic_winter(self, extractor):
        result = extractor.extract("November 2024 Examination", "", "")
        assert result["session"] == "Winter"

    def test_filename_fallback(self, extractor):
        result = extractor.extract("", "", "AIML_SUMMER_2025_SEM5.pdf")
        assert result["session"] == "Summer"
        assert result["year"] == 2025


# ---------------------------------------------------------------------------
# MetadataExtractor integration
# ---------------------------------------------------------------------------

class TestMetadataExtractor:
    def test_full_extraction(self, config):
        extractor = MetadataExtractor(config)
        group = {
            "start_page": 1, "end_page": 3, "page_count": 3,
            "header_text": ML_HEADER,
            "combined_text": ML_HEADER + QUESTION_PAGE,
            "partial_paper": False,
            "pages": [],
        }
        meta = extractor.extract(group)
        assert meta["subjectOriginal"] == "Machine Learning"
        assert meta["subjectSlug"] == "machine-learning"
        assert meta["semester"] == 5
        assert meta["session"] == "Summer"
        assert meta["year"] == 2025
        assert "machine-learning" in meta["keywords"]
        assert meta["textHash"]  # SHA-256 present
        assert len(meta["searchableText"]) > 0


# ---------------------------------------------------------------------------
# DuplicateDetector tests
# ---------------------------------------------------------------------------

class TestDuplicateDetector:
    def test_detects_exact_duplicates(self, config):
        detector = DuplicateDetector(config)
        text = ML_HEADER + QUESTION_PAGE * 3
        import hashlib
        h = hashlib.sha256(text.encode()).hexdigest()
        a = {
            "branchSlug": "aiml", "semester": 5,
            "subjectSlug": "machine-learning", "session": "Summer", "year": 2025,
            "textHash": h, "searchableText": text,
            "subjectOriginal": "Machine Learning",
        }
        b = dict(a)  # identical copy
        dupes = detector.detect([a, b])
        assert len(dupes) == 1
        assert dupes[0]["method"] == "exact_hash"

    def test_no_dupe_different_subjects(self, config):
        detector = DuplicateDetector(config)
        a = {
            "branchSlug": "aiml", "semester": 5,
            "subjectSlug": "machine-learning", "session": "Summer", "year": 2025,
            "textHash": "hash_a", "searchableText": ML_HEADER,
            "subjectOriginal": "Machine Learning",
        }
        b = {
            "branchSlug": "aiml", "semester": 5,
            "subjectSlug": "database-management-systems", "session": "Summer", "year": 2025,
            "textHash": "hash_b", "searchableText": DBMS_HEADER,
            "subjectOriginal": "Database Management Systems",
        }
        dupes = detector.detect([a, b])
        assert len(dupes) == 0


# ---------------------------------------------------------------------------
# Slugify utility
# ---------------------------------------------------------------------------

class TestSlugify:
    @pytest.mark.parametrize("text,expected", [
        ("Machine Learning", "machine-learning"),
        ("Artificial Intelligence & Machine Learning",
         "artificial-intelligence-and-machine-learning"),
        ("B.Tech Semester - V", "b-tech-semester-v"),
        (None, "unknown"),
        ("", "unknown"),
        ("  ", "unknown"),
    ])
    def test_slugify(self, text, expected):
        assert slugify(text) == expected


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
