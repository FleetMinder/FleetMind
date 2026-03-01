import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId, getProtectedCompanyId } from "@/lib/company";

export async function GET() {
  try {
    const companyId = await getCompanyId();
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId },
      orderBy: { targa: "asc" },
      include: {
        maintenances: {
          orderBy: { data: "desc" },
          take: 5,
        },
        trips: {
          where: { stato: { in: ["in_corso", "approvato"] } },
          select: { id: true, stato: true },
        },
      },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Vehicles GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei mezzi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getProtectedCompanyId();
    const body = await request.json();

    const vehicle = await prisma.vehicle.create({
      data: {
        ...body,
        companyId,
        prossimaRevisione: body.prossimaRevisione
          ? new Date(body.prossimaRevisione)
          : null,
        assicurazioneScadenza: body.assicurazioneScadenza
          ? new Date(body.assicurazioneScadenza)
          : null,
        bolloScadenza: body.bolloScadenza
          ? new Date(body.bolloScadenza)
          : null,
        adrScadenza: body.adrScadenza
          ? new Date(body.adrScadenza)
          : null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_EXPIRED") {
      return NextResponse.json({ error: "Trial scaduto" }, { status: 403 });
    }
    console.error("Vehicles POST error:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del mezzo" },
      { status: 500 }
    );
  }
}
