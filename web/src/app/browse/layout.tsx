import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse BVDU Engineering Question Papers | PeerAtlas",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
