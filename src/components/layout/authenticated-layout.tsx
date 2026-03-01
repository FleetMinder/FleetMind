"use client";

import { Suspense } from "react";
import { Sidebar } from "./sidebar";
import { PaywallOverlay } from "@/components/paywall-overlay";

interface Props {
  children: React.ReactNode;
  showPaywall?: boolean;
  isDemoUser?: boolean;
  trialDaysLeft?: number | null;
}

export function AuthenticatedLayout({
  children,
  showPaywall = false,
  isDemoUser = false,
  trialDaysLeft = null,
}: Props) {
  return (
    <>
      <Sidebar isDemoUser={isDemoUser} trialDaysLeft={trialDaysLeft} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">{children}</div>
      </main>
      {showPaywall && (
        <Suspense>
          <PaywallOverlay isDemoUser={isDemoUser} />
        </Suspense>
      )}
    </>
  );
}
