import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();
    const { stato } = body;

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, companyId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Viaggio non trovato" }, { status: 404 });
    }

    const updated = await prisma.trip.update({
      where: { id: params.id },
      data: { stato },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: "trip_status",
        messaggio: `Viaggio aggiornato a: ${stato}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Trip PATCH error:", error);
    return NextResponse.json({ error: "Errore aggiornamento viaggio" }, { status: 500 });
  }
}
