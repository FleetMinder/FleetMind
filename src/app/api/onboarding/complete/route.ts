import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Se l'utente ha un'azienda, segna onboarding come completato
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (session.user.companyId) {
      await prisma.company.update({
        where: { id: session.user.companyId },
        data: { onboardingCompleted: true, trialEndsAt },
      });
      return NextResponse.json({ success: true });
    }

    // Se non ha azienda (ha skippato lo step 1), creane una placeholder
    const company = await prisma.company.create({
      data: {
        nome: "La mia azienda",
        indirizzo: "-",
        citta: "-",
        cap: "00000",
        piva: `TEMP-${Date.now()}`,
        onboardingCompleted: true,
        trialEndsAt,
        users: {
          connect: { id: session.user.id },
        },
      },
    });

    // Se il nome non è impostato, usa l'email
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.nome) {
      const userEmail = session.user.email || "";
      await prisma.user.update({
        where: { id: session.user.id },
        data: { nome: userEmail.split("@")[0] || "Utente" },
      });
    }

    return NextResponse.json({ success: true, companyId: company.id });
  } catch (error) {
    console.error("Errore onboarding complete:", error);
    return NextResponse.json(
      { error: "Errore nel completamento dell'onboarding" },
      { status: 500 }
    );
  }
}
