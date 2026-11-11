<div align="center">

# 🗺️ PeerAtlas

**Find the right paper in under 5 seconds.**

A search-first archive of engineering previous year question papers (PYQs).

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Convex](https://img.shields.io/badge/Convex-EE342F?logo=convex&logoColor=white)](https://convex.dev)
[![Python](https://img.shields.io/badge/Python-OCR_pipeline-3776AB?logo=python&logoColor=white)](./ocr)
[![License](https://img.shields.io/github/license/dhruvp-dev/PeerAtlas)](./LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Better Auth](https://img.shields.io/badge/Auth-Better_Auth-2563EB)](https://www.better-auth.com)
[![PostHog](https://img.shields.io/badge/Analytics-PostHog-F9BD2B?logo=posthog&logoColor=black)](https://posthog.com)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Last commit](https://img.shields.io/github/last-commit/dhruvp-dev/PeerAtlas)](https://github.com/dhruvp-dev/PeerAtlas/commits/main)
[![Stars](https://img.shields.io/github/stars/dhruvp-dev/PeerAtlas?style=flat)](https://github.com/dhruvp-dev/PeerAtlas/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/dhruvp-dev/PeerAtlas/pulls)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Structure](#-repository-structure) · [Getting Started](#-getting-started) · [Docs](#-documentation) · [Contributing](#-contributing) · [License](#-license)

</div>

---

## 📖 About

PeerAtlas helps students quickly find, filter, and access question papers without navigating complex folder structures or poorly organized Google Drives.

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔎 | **Blazing Fast Search** | Search by subject name, branch, semester, session, or year. |
| 🎛️ | **Streamlined Filtering** | Drill down into papers by branch and semester. |
| 📄 | **Instant Preview & Download** | View PDFs in the browser with one click. |
| 📱 | **Mobile First** | Fully responsive on phones and tablets. |
| 🛠️ | **Admin Management** | Dedicated portal for uploading papers and managing the archive. |

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React 19, TypeScript, Tailwind CSS |
| Backend / DB | Convex (database + cloud file storage) |
| Auth | Better Auth |
| Analytics | PostHog, Vercel Analytics, Speed Insights |
| Ingestion | Python OCR pipeline |
| Testing | Vitest |

## 🏗️ Repository Structure

```text
PeerAtlas/
├── web/    # Next.js app: search UI, paper browsing, PDF viewer, admin dashboard
├── ocr/    # Python OCR pipeline: ingestion & metadata extraction from raw PDFs
├── docs/   # Product, design and data-model documentation
└── assets/
```

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

## 📚 Documentation

- [Product Requirements](./docs/prd.md)
- [Product Overview](./docs/product.md)
- [Design](./docs/design.md)
- [Data Model](./docs/data_model.md)
- [How we OCR'd 1500 papers](./docs/how_we_ocred_1500_papers.md)

## 🤝 Contributing

Contributions are welcome! Fork the repo, create a branch, and open a pull request. Run `npm test` and `npm run lint` in `web/` before submitting.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
