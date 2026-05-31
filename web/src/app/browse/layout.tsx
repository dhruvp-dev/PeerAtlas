import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Previous Year Question Papers — BVDU Engineering | PeerAtlas",
  description: "Browse and filter Bharati Vidyapeeth engineering previous year question papers by branch, semester, subject, and year. Instant download.",
  alternates: {
    canonical: "/browse",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
