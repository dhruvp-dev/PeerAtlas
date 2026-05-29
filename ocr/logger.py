"""
utils/logger.py
================
Centralised logging setup for PeerAtlas.

Features:
  - Coloured console output by level
  - Rotating file log: peeratlas_run.log
  - Module-scoped loggers via get_logger(name)
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

LOG_FILE = Path("peeratlas_run.log")

# ANSI colour codes
_COLOURS = {
    "DEBUG":    "\033[36m",   # Cyan
    "INFO":     "\033[32m",   # Green
    "WARNING":  "\033[33m",   # Yellow
    "ERROR":    "\033[31m",   # Red
    "CRITICAL": "\033[35m",   # Magenta
    "RESET":    "\033[0m",
}


class _ColouredFormatter(logging.Formatter):
    FMT = "%(asctime)s [%(levelname)s] %(name)s — %(message)s"
    DATEFMT = "%H:%M:%S"

    def format(self, record: logging.LogRecord) -> str:
        colour = _COLOURS.get(record.levelname, "")
        reset  = _COLOURS["RESET"]
        record.levelname = f"{colour}{record.levelname}{reset}"
        return super().format(record)


_configured = False


def _configure_root() -> None:
    global _configured
    if _configured:
        return
    _configured = True

    root = logging.getLogger("peeratlas")
    root.setLevel(logging.DEBUG)

    # Console handler — INFO and above
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    ch.setFormatter(_ColouredFormatter(
        fmt=_ColouredFormatter.FMT,
        datefmt=_ColouredFormatter.DATEFMT,
    ))
    root.addHandler(ch)

    # File handler — DEBUG and above
    fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    root.addHandler(fh)


def get_logger(name: str) -> logging.Logger:
    _configure_root()
    return logging.getLogger(f"peeratlas.{name}")
