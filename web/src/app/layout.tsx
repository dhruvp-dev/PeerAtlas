import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PeerAtlas — Bharati Vidyapeeth Deemed University Engineering Papers",
  description: "Find Bharati Vidyapeeth Deemed University engineering previous year question papers in under 5 seconds.",
  keywords: [
    "Bharati Vidyapeeth Deemed University",
    "BVDU",
    "Engineering Papers",
    "Previous Year Question Papers",
    "B.Tech",
    "Pune"
  ],
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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

