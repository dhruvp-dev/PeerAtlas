"use client";

import { useAnalytics } from "@/lib/analytics";

interface GitHubLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function GitHubLink({ children, ...props }: GitHubLinkProps) {
  const { track } = useAnalytics();

  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        props.onClick?.(e);
        track("external_link_clicked", { destination: "github" });
      }}
    >
      {children}
    </a>
  );
}
