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
  title: "FleetMind - Il cervello della tua flotta",
  description:
    "Pianificazione intelligente dei trasporti su gomma con AI. Ottimizza rotte, assegna autisti e gestisci la tua flotta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} ${satoshi.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <ThemeToaster />
        </Providers>
      </body>
    </html>
  );
}
