import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Vehicle PATCH error:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del mezzo" },
      { status: 500 }
    );
  }
}
