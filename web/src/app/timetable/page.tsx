import { Metadata } from "next";
import TimetableClient from "./client";

export const metadata: Metadata = {
  title: "Winter 2026 Theory Timetable | PeerAtlas",
  description:
    "View and download the latest Winter 2026 theory timetable for College of Engineering - Pune Navi Mumbai Campus on PeerAtlas.",
  alternates: {
    canonical: "/timetable",
  },
};

export default function Page() {
  return <TimetableClient />;
}
