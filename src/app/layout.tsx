import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.unbiasy.com"),
  title: {
    default: "Unbiasy — AI Content Understanding & Bias Awareness",
    template: "%s | Unbiasy",
  },
  description:
    "An educational platform that helps students understand how digital content may contain bias, stereotypes, or one-sided narratives. Analyze YouTube videos, PDFs, and images.",
  keywords: [
    "unbiasy",
    "bias detection",
    "media literacy",
    "critical thinking",
    "content analysis",
    "AI bias awareness",
    "education",
    "YouTube bias analysis",
  ],
  authors: [{ name: "Unbiasy", url: "https://www.unbiasy.com" }],
  creator: "Unbiasy",
  publisher: "Unbiasy",
  alternates: {
    canonical: "https://www.unbiasy.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.unbiasy.com",
    siteName: "Unbiasy",
    title: "Unbiasy — AI Content Understanding & Bias Awareness",
    description:
      "An educational platform that helps students understand how digital content may contain bias, stereotypes, or one-sided narratives.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unbiasy — AI Content Understanding & Bias Awareness",
    description:
      "An educational platform that helps students understand how digital content may contain bias, stereotypes, or one-sided narratives.",
    site: "@unbiasy",
    creator: "@unbiasy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
