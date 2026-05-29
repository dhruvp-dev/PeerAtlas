# PeerAtlas

> **Find the right paper in under 5 seconds.**

PeerAtlas is a search-first academic archive for engineering previous year question papers (PYQs). It is designed to help students quickly find, filter, and access question papers without navigating complex folder structures or poorly organized Google Drives.

## 🏗️ Repository Structure

This is a monorepo containing two main parts:

- **[`/web`](./web)**: The Next.js web application (Frontend + API Routes). It serves the search interface, paper browsing, PDF viewing, and an administrative dashboard for catalog management.
- **[`/ocr`](./ocr)**: The Python-based Optical Character Recognition (OCR) pipeline. It handles the ingestion, processing, and metadata extraction of raw PDF question papers before they are uploaded to the web catalog.

## ✨ Core Features

- **Blazing Fast Search**: Search by subject name, branch, semester, session, or year.
- **Streamlined Filtering**: Easily drill down into papers by branch and semester.
- **Instant Preview & Download**: View PDF papers directly in the browser with one click.
- **Mobile First**: Fully responsive design ensuring seamless access from phones and tablets.
- **Admin Management**: Dedicated portal for uploading new papers and managing the archive.

## 🚀 Getting Started

### Web Application (Next.js)
The frontend is built with Next.js App Router, Tailwind CSS, and Convex for the backend database.
```bash
cd web
npm install
npm run dev
```
*See the [Web README](./web/README.md) for more details on environment variables and deployment.*

### OCR Pipeline (Python)
The backend document processing service.
```bash
cd ocr
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
*See the [OCR README](./ocr/README.md) for more details on the ingestion pipeline.*

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
