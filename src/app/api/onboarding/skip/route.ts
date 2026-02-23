import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Se l'utente ha già un'azienda, segna solo onboarding completato
    if (session.user.companyId) {
      await prisma.company.update({
        where: { id: session.user.companyId },
        data: { onboardingCompleted: true },
      });
      return NextResponse.json({ success: true, companyId: session.user.companyId });
    }

    // Crea un'azienda placeholder e collega l'utente
    const userEmail = session.user.email || "";
    const company = await prisma.company.create({
      data: {
        nome: "La mia azienda",
        indirizzo: "-",
        citta: "-",
        cap: "00000",
        piva: `TEMP-${Date.now()}`,
        onboardingCompleted: true,
        users: {
          connect: { id: session.user.id },
        },
      },
    });

    // Se il nome non è impostato, usa l'email come nome
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.nome) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          nome: userEmail.split("@")[0] || "Utente",
        },
      });
    }

    return NextResponse.json({ success: true, companyId: company.id });
  } catch (error) {
    console.error("Errore onboarding skip:", error);
    return NextResponse.json(
      { error: "Errore nel salto dell'onboarding" },
      { status: 500 }
    );
  }
}
