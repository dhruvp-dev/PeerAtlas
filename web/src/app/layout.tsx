import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-2xl mx-auto min-h-screen">
            <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-xl animate-in fade-in zoom-in duration-700">
              <img 
                src="/maintenance-bot.png" 
                alt="Cute robot performing maintenance" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-both">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                We're fixing some gears!
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                PeerAtlas is currently undergoing scheduled maintenance to improve your experience and update our knowledge base. We'll be back online shortly to help you with your studies.
              </p>
              <p className="text-sm font-medium text-muted-foreground/80">
                Thank you for your patience!
              </p>
            </div>
            <div className="pt-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                System Updating...
              </div>
            </div>
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
