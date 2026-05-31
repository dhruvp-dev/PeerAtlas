import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PaperClient from "./client";
import { getPaperSchema, getBreadcrumbSchema } from "@/lib/structured-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const isValidId = typeof id === "string" && id.length === 32;
  if (!isValidId) return { title: "Paper Not Found | PeerAtlas" };

  try {
    const paper = await fetchQuery(api.papers.get, { id: id as any });
    if (!paper) return { title: "Paper Not Found | PeerAtlas" };

    return {
      title: `${paper.subject} Previous Year Question Papers | ${paper.branch} Semester ${paper.semester} | PeerAtlas`,
      description: `Download the ${paper.subject} previous year question paper for ${paper.branch}, Semester ${paper.semester} (${paper.session ?? ""} ${paper.year}). Free PDF on PeerAtlas.`,
      alternates: {
        canonical: `/paper/${id}`,
      },
    };
  } catch (error) {
    return { title: "Paper Not Found | PeerAtlas" };
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const isValidId = typeof id === "string" && id.length === 32;
  
  if (!isValidId) {
    notFound();
  }

  let paper;
  let relatedPapers;

  try {
    paper = await fetchQuery(api.papers.get, { id: id as any });
    if (!paper) {
      notFound();
    }

    relatedPapers = await fetchQuery(api.papers.getRelated, {
      branchSlug: paper.branchSlug,
      semester: paper.semester,
      currentPaperId: paper._id,
    });
  } catch (error) {
    console.error("Failed to fetch paper:", error);
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", item: "https://peeratlas.qzz.io/" },
    { name: "Browse", item: "https://peeratlas.qzz.io/browse" },
    { name: `Semester ${paper.semester}`, item: `https://peeratlas.qzz.io/browse?semester=${paper.semester}` },
    { name: paper.branch, item: `https://peeratlas.qzz.io/browse?branch=${paper.branchSlug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPaperSchema(paper)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema(breadcrumbItems)),
        }}
      />
      <PaperClient paper={paper} relatedPapers={relatedPapers} />
    </>
  );
}
