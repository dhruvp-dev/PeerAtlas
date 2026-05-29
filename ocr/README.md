# PeerAtlas OCR Pipeline

The ingestion and processing engine for the PeerAtlas catalog. 

This Python-based service is responsible for taking raw PDF question papers, running Optical Character Recognition (OCR), extracting relevant metadata (Subject, Branch, Semester, Year, etc.), and preparing the structured data for upload to the Convex backend.

## 🛠️ Architecture

- **Input**: Raw `.pdf` question papers from the university.
- **Processing**: Extracts text, identifies keywords, and parses metadata based on known patterns.
- **Output**: Structured JSON objects and sanitized PDFs ready to be pushed to the PeerAtlas web catalog.

## 📦 Setup & Installation

1. **Create Virtual Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   # Assuming a requirements.txt exists
   pip install -r requirements.txt
   ```

## 🚀 Usage
*Documentation for the ingestion pipeline scripts will be updated as the OCR service matures.*

> **Note**: The web frontend operates independently of this pipeline. The web app assumes that papers processed here have successfully made their way into the Convex database.
