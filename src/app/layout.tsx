import type { Metadata } from "next";
import "./globals.css";

import { LanguageProvider } from "@/lib/context/LanguageContext";
import DynamicTitle from "@/components/DynamicTitle";

export const metadata: Metadata = {
  title: "YojanaAI — Find Government Schemes",
  description:
    "Free AI tool that finds every Indian" +
    " government scheme you qualify for." +
    " 770+ schemes, 8 languages, no login.",
  metadataBase: new URL("https://yojanai-rosy.vercel.app"),
  openGraph: {
    title: "YojanaAI — Find Government Schemes",
    description:
      "Free AI tool that finds every Indian" +
      " government scheme you qualify for." +
      " 770+ schemes, 8 languages, no login.",
    url: "https://yojanai-rosy.vercel.app",
    siteName: "YojanaAI",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "YojanaAI — Find Government Schemes",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YojanaAI — Find Government Schemes",
    description:
      "Free AI. 770+ schemes. 8 languages." + " No login.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <DynamicTitle />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
