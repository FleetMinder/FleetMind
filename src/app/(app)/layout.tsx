import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cookieStore = cookies();

  let showPaywall = false;
  let trialDaysLeft: number | null = null;
  const isDemoUser = session?.user?.isDemoUser ?? false;

  if (session?.user) {
    if (isDemoUser) {
      // Demo: accesso libero finché demo_trial cookie (24h) è presente
      const demoCookie = cookieStore.get("demo_trial");
      if (!demoCookie) {
        showPaywall = true;
      }
      // Non mostriamo countdown per demo — usiamo badge separato nel sidebar
    } else if (session.user.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { trialEndsAt: true, subscriptionStatus: true },
      });

      if (company) {
        const hasActiveSubscription = ["active", "trialing"].includes(
          company.subscriptionStatus || ""
        );

        if (company.trialEndsAt) {
          const msLeft = company.trialEndsAt.getTime() - Date.now();
          const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

          if (!hasActiveSubscription) {
            if (daysLeft === 0) {
              showPaywall = true;
            } else {
              // Trial ancora attivo — mostra countdown
              trialDaysLeft = daysLeft;
            }
          }
        } else if (!hasActiveSubscription) {
          // Nessun trial e nessun abbonamento
          showPaywall = true;
        }
      }
    }
  }

  return (
    <AuthenticatedLayout
      showPaywall={showPaywall}
      isDemoUser={isDemoUser}
      trialDaysLeft={trialDaysLeft}
    >
      {children}
    </AuthenticatedLayout>
  );
}
