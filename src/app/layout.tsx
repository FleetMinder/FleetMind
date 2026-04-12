import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeToaster } from "@/components/theme-toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/satoshi-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FleetMind - AI Dispatch Planner per la logistica italiana",
  description:
    "Pianifica viaggi, gestisci compliance e proteggi i tuoi margini. La piattaforma AI per il trasporto su gomma.",
  metadataBase: new URL("https://www.fleetmind.co"),
  openGraph: {
    title: "FleetMind - AI Dispatch Planner",
    description:
      "Pianifica viaggi, gestisci compliance e proteggi i tuoi margini. La piattaforma AI per il trasporto su gomma.",
    url: "https://www.fleetmind.co",
    siteName: "FleetMind",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FleetMind - AI Dispatch Planner",
    description:
      "Pianifica viaggi, gestisci compliance e proteggi i tuoi margini.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FleetMind" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} ${satoshi.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <ThemeToaster />
        </Providers>
      </body>
    </html>
  );
}
