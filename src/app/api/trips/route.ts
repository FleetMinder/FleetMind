import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";

export async function GET() {
  try {
    const companyId = await getProtectedCompanyId();

    const trips = await prisma.trip.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        driver: {
          select: { id: true, nome: true, cognome: true },
        },
        vehicle: {
          select: { id: true, targa: true, tipo: true },
        },
        orders: {
          select: {
            id: true,
            codiceOrdine: true,
            mittenteCitta: true,
            mittenteIndirizzo: true,
            destinatarioCitta: true,
            destinatarioIndirizzo: true,
            pesoKg: true,
            tipoMerce: true,
            urgenza: true,
          },
        },
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_EXPIRED") {
      return NextResponse.json({ error: "Trial scaduto" }, { status: 403 });
    }
    console.error("Trips API error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei viaggi" },
      { status: 500 }
    );
  }
}
