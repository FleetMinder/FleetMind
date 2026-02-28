import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, provincia, numerVeicoli } = body;

    if (!nome?.trim()) {
      return NextResponse.json({ error: "Nome azienda obbligatorio" }, { status: 400 });
    }

    // Verifica se l'utente ha già un'azienda
    if (session.user.companyId) {
      return NextResponse.json({ error: "Azienda già configurata" }, { status: 400 });
    }

    // Genera un piva placeholder unico (aggiornabile in seguito dalle impostazioni)
    const pivaTemp = `TEMP${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    const company = await prisma.company.create({
      data: {
        nome: nome.trim(),
        indirizzo: "Da configurare",
        citta: provincia || "IT",
        cap: "00000",
        piva: pivaTemp,
        users: {
          connect: { id: session.user.id },
        },
      },
    });

    // Salva nota flotta se fornita (non critica)
    if (numerVeicoli) {
      await prisma.activityLog.create({
        data: {
          companyId: company.id,
          tipo: "onboarding",
          messaggio: `Flotta dichiarata: ${numerVeicoli} veicoli — ${provincia || "N/D"}`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ companyId: company.id });
  } catch (error) {
    console.error("Errore onboarding company:", error);
    return NextResponse.json(
      { error: "Errore nella creazione dell'azienda" },
      { status: 500 }
    );
  }
}
