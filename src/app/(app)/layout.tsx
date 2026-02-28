import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cookieStore = cookies();

  let showPaywall = false;
  const isDemoUser = session?.user?.isDemoUser ?? false;

  if (session?.user) {
    if (isDemoUser) {
      // Demo: accesso libero finché il cookie demo_trial (24h) è presente
      const demoCookie = cookieStore.get("demo_trial");
      if (!demoCookie) {
        showPaywall = true;
      }
    } else if (session.user.companyId) {
      // Utenti normali: controlla trial e subscription
      const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { trialEndsAt: true, subscriptionStatus: true },
      });
      if (company) {
        const hasActiveSubscription = ["active", "trialing"].includes(
          company.subscriptionStatus || ""
        );
        const trialExpired =
          !company.trialEndsAt || company.trialEndsAt < new Date();
        showPaywall = !hasActiveSubscription && trialExpired;
      }
    }
  }

  return (
    <AuthenticatedLayout showPaywall={showPaywall} isDemoUser={isDemoUser}>
      {children}
    </AuthenticatedLayout>
  );
}
