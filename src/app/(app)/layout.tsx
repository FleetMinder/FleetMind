import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  let showPaywall = false;

  if (session?.user && !session.user.isDemoUser && session.user.companyId) {
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

  return (
    <AuthenticatedLayout showPaywall={showPaywall}>
      {children}
    </AuthenticatedLayout>
  );
}
