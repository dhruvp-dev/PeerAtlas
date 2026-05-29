# PeerAtlas Web Client

The web interface for PeerAtlas, built to provide a blazing-fast, search-first experience for students accessing previous year question papers.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Convex](https://convex.dev/) (Real-time database, functions, and storage)
- **Authentication**: [Better Auth](https://better-auth.com/) (Admin routes)
- **Admin Database**: [Turso](https://turso.tech/) (LibSQL for Better Auth tables)

## 📦 Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the `web` directory:
   ```env
   # Convex Development
   CONVEX_DEPLOYMENT=...
   NEXT_PUBLIC_CONVEX_URL=...
   NEXT_PUBLIC_CONVEX_SITE_URL=...

   # Admin Auth (Turso + Better Auth)
   BETTER_AUTH_SECRET=...
   BETTER_AUTH_URL=http://localhost:3000
   TURSO_DATABASE_URL=...
   TURSO_AUTH_TOKEN=...
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=...
   ```

3. **Start Development Server**
   ```bash
   # Terminal 1: Run Convex backend
   npx convex dev

   # Terminal 2: Run Next.js frontend
   npm run dev
   ```

## 🔒 Security & Performance
- **React Server Components (RSC)** used extensively for fast initial page loads and zero client-side waterfalls.
- **Middleware + Server Validation**: Admin routes (`/admin/*`) are protected at the edge via cookie checks, and cryptographically verified on the server via `auth.api.getSession()`.
- **Security Headers**: Configured via `next.config.ts` (CSP, X-Frame-Options, etc.).

## 🚀 Deployment
This project is optimized for deployment on **Vercel**. 
Ensure you set separate production variables for Turso, Better Auth, and Convex in the Vercel dashboard. Do not use local `.env.local` values in production.
