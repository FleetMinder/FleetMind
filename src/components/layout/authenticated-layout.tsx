"use client";

import { Sidebar } from "./sidebar";
import { PaywallOverlay } from "@/components/paywall-overlay";

interface Props {
  children: React.ReactNode;
  showPaywall?: boolean;
}

export function AuthenticatedLayout({ children, showPaywall = false }: Props) {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">{children}</div>
      </main>
      {showPaywall && <PaywallOverlay />}
    </>
  );
}
