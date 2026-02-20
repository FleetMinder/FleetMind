import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FleetMind - AI Dispatch Planner",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(217 33% 17%)",
                border: "1px solid hsl(217 33% 22%)",
                color: "hsl(210 40% 98%)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
