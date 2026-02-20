import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, indirizzo, citta, cap, piva, telefono, email, userNome, userCognome } = body;

    if (!nome || !indirizzo || !citta || !cap || !piva) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    }

    // Verifica se l'utente ha già un'azienda
    if (session.user.companyId) {
      return NextResponse.json({ error: "Azienda già configurata" }, { status: 400 });
    }

    // Crea azienda e collega l'utente in una transazione
    const company = await prisma.company.create({
      data: {
        nome,
        indirizzo,
        citta,
        cap,
        piva,
        telefono: telefono || null,
        email: email || null,
        users: {
          connect: { id: session.user.id },
        },
      },
    });

    // Aggiorna nome e cognome dell'utente
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nome: userNome || null,
        cognome: userCognome || null,
      },
    });

    return NextResponse.json({ companyId: company.id });
  } catch (error) {
    console.error("Errore onboarding company:", error);
    return NextResponse.json(
      { error: "Errore nella creazione dell'azienda" },
      { status: 500 }
    );
  }
}
