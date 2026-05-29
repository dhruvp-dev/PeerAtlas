"""
utils/slugify.py
================
Convert arbitrary text into a URL/filesystem-safe slug.

Examples:
  "Machine Learning"                       → "machine-learning"
  "Artificial Intelligence & Machine Learning" → "artificial-intelligence-and-machine-learning"
  "B.Tech Semester - V"                    → "btech-semester-v"
"""

from __future__ import annotations

import re
import unicodedata


def slugify(text: str | None, separator: str = "-") -> str:
    """Return a clean lowercase slug for *text*."""
    if not text:
        return "unknown"

    # Unicode normalise → ASCII
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")

    # Replace & with 'and'
    text = re.sub(r"\s*&\s*", " and ", text)

    # Lowercase
    text = text.lower()

    # Replace punctuation / whitespace with separator
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"[\s_]+", separator, text).strip(separator)

    return text or "unknown"
