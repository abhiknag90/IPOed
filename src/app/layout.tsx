import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketProvider } from "@/lib/market-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IPO'ed — IPO Intelligence Platform",
    template: "%s | IPO'ed",
  },
  description:
    "Make sense of IPO data with AI-powered analysis. Track upcoming IPOs, analyze DRHP/S-1 documents, and get AI verdicts for India & US markets.",
  keywords: ["IPO", "DRHP", "S-1", "stock market", "NSE", "BSE", "NYSE", "NASDAQ", "IPO analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MarketProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </MarketProvider>
      </body>
    </html>
  );
}
