import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YojanAI — Find Government Schemes You Deserve",
  description:
    "AI-powered tool to discover Indian government welfare schemes you are eligible for. Answer a few questions and get matched with benefits, documents, and application steps.",
  keywords: [
    "government schemes",
    "welfare",
    "India",
    "AI",
    "yojana",
    "benefits",
    "eligibility",
  ],
};

import { LanguageProvider } from "@/lib/context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
