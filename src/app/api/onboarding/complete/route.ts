import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Azienda non configurata" }, { status: 400 });
    }

    // Segna onboarding come completato
    await prisma.company.update({
      where: { id: session.user.companyId },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore onboarding complete:", error);
    return NextResponse.json(
      { error: "Errore nel completamento dell'onboarding" },
      { status: 500 }
    );
  }
}
