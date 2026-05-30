import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PeerAtlas — BVDU Engineering Previous Year Question Papers",
  description: "Find Bharati Vidyapeeth Deemed University (BVDU) engineering previous year question papers in under 5 seconds. Free and organized by semester.",
  keywords: [
    "Bharati Vidyapeeth Deemed University",
    "BVDU",
    "Engineering Papers",
    "Previous Year Question Papers",
    "B.Tech",
    "Pune"
  ],
  openGraph: {
    title: "PeerAtlas — BVDU Engineering Previous Year Question Papers",
    description: "Find Bharati Vidyapeeth Deemed University (BVDU) engineering previous year question papers in under 5 seconds. Free and organized by semester.",
    url: "https://peeratlas.vercel.app",
    siteName: "PeerAtlas",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PeerAtlas — BVDU Engineering Previous Year Question Papers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PeerAtlas — BVDU Engineering Previous Year Question Papers",
    description: "Find Bharati Vidyapeeth Deemed University (BVDU) engineering previous year question papers in under 5 seconds. Free and organized by semester.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

