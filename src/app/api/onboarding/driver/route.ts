import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Azienda non configurata" }, { status: 400 });
    }

    const body = await request.json();
    const {
      nome,
      cognome,
      codiceFiscale,
      patenteTipo,
      patenteNumero,
      patenteScadenza,
      cartaCQC,
      cqcScadenza,
      tachigrafoScadenza,
      telefono,
    } = body;

    if (!nome || !cognome || !codiceFiscale || !patenteTipo || !patenteNumero || !patenteScadenza || !tachigrafoScadenza) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    }

    const driver = await prisma.driver.create({
      data: {
        companyId: session.user.companyId,
        nome,
        cognome,
        codiceFiscale,
        patenteTipo,
        patenteNumero,
        patenteScadenza: new Date(patenteScadenza),
        cartaCQC: cartaCQC || null,
        cqcScadenza: cqcScadenza ? new Date(cqcScadenza) : null,
        tachigrafoScadenza: new Date(tachigrafoScadenza),
        telefono: telefono || null,
      },
    });

    return NextResponse.json({ driverId: driver.id });
  } catch (error) {
    console.error("Errore onboarding driver:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiunta dell'autista" },
      { status: 500 }
    );
  }
}
