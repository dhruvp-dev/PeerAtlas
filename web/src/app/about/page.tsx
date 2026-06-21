import { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About PeerAtlas — Helping Students Find Academic Papers",
  description: "Learn about the mission of PeerAtlas. Report academic resource issues, contact the author directly, or contribute question papers to help other students.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
