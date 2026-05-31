export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PeerAtlas",
    url: "https://peeratlas.qzz.io",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://peeratlas.qzz.io/browse?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getCollectionPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse Previous Year Question Papers",
    description: "Browse Bharati Vidyapeeth engineering previous year question papers by branch, semester, subject, and year.",
    url: "https://peeratlas.qzz.io/browse",
  };
}

export function getPaperSchema(paper: any) {
  return {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "DigitalDocument"],
    name: `${paper.subject} Previous Year Question Paper`,
    description: `Previous year question paper for ${paper.subject}, ${paper.branch} Semester ${paper.semester}.`,
    url: `https://peeratlas.qzz.io/paper/${paper._id}`,
    educationalLevel: "University",
    educationalUse: "Exam Preparation",
    datePublished: new Date(paper.createdAt).toISOString(),
    provider: {
      "@type": "Organization",
      name: "PeerAtlas",
      url: "https://peeratlas.qzz.io",
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}
