import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";

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
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">{children}</div>
        </main>
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
      </body>
    </html>
  );
}
