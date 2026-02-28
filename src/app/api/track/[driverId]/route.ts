import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { driverId: string } }
) {
  const driver = await prisma.driver.findUnique({
    where: { id: params.driverId },
    select: { id: true, nome: true, cognome: true, stato: true },
  });
  if (!driver) return NextResponse.json({ error: "Autista non trovato" }, { status: 404 });
  return NextResponse.json(driver);
}

export async function POST(
  req: Request,
  { params }: { params: { driverId: string } }
) {
  try {
    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Coordinate non valide" }, { status: 400 });
    }

    // Bounding box Europa
    if (lat < 34 || lat > 72 || lng < -25 || lng > 45) {
      return NextResponse.json({ error: "Coordinate fuori dal range" }, { status: 400 });
    }

    await prisma.driver.update({
      where: { id: params.driverId },
      data: { latitudine: lat, longitudine: lng },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Errore aggiornamento posizione" }, { status: 500 });
  }
}
