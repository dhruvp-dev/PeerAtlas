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
  title: "PeerAtlas — Under Maintenance",
  description: "PeerAtlas is currently undergoing scheduled maintenance. We'll be back online shortly.",
  keywords: [
    "Bharati Vidyapeeth Deemed University",
    "BVDU",
    "Engineering Papers",
    "Previous Year Question Papers",
    "Maintenance"
  ],
  openGraph: {
    title: "PeerAtlas — Under Maintenance",
    description: "PeerAtlas is currently undergoing scheduled maintenance. We'll be back online shortly.",
    url: "https://peeratlas.vercel.app",
    siteName: "PeerAtlas",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PeerAtlas — Under Maintenance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PeerAtlas — Under Maintenance",
    description: "PeerAtlas is currently undergoing scheduled maintenance. We'll be back online shortly.",
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
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-10 max-w-3xl mx-auto min-h-screen">
            <div className="flex items-center gap-3 justify-center mb-4 animate-in fade-in zoom-in duration-700 drop-shadow-sm">
              <img src="/Peer_Logo.svg" alt="PeerAtlas Logo" className="w-10 h-10 shrink-0 logo-light" />
              <img src="/Dark_Peer_Logo.svg" alt="PeerAtlas Logo" className="w-10 h-10 shrink-0 logo-dark" />
              <span className="text-3xl font-bold tracking-tight text-foreground font-sans">
                Peer<span className="text-primary font-medium">Atlas</span>
              </span>
            </div>
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-both">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 drop-shadow-sm leading-tight">
                Looks like someone left the papers all over the floor.
              </h1>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                  We're putting everything back where it belongs.
                </p>
                <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                  PeerAtlas will be back online shortly.
                </p>
              </div>
            </div>
            <div className="pt-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Organizing archive
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
