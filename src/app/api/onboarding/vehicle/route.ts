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
      targa,
      tipo,
      marca,
      modello,
      anno,
      capacitaPesoKg,
      capacitaVolumeM3,
      consumoKmL,
      prossimaRevisione,
    } = body;

    if (!targa || !tipo || !marca || !modello || !anno || !capacitaPesoKg || !capacitaVolumeM3) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: session.user.companyId,
        targa,
        tipo,
        marca,
        modello,
        anno,
        capacitaPesoKg,
        capacitaVolumeM3,
        consumoKmL: consumoKmL || null,
        prossimaRevisione: prossimaRevisione ? new Date(prossimaRevisione) : null,
      },
    });

    return NextResponse.json({ vehicleId: vehicle.id });
  } catch (error) {
    console.error("Errore onboarding vehicle:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiunta del mezzo" },
      { status: 500 }
    );
  }
}
