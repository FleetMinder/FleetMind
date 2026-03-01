import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";
import type { Check } from "@/lib/dispatch/types";
import type { AssignmentRow } from "@/components/dispatch/AssignmentCard";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId richiesto" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { companyId, orderId, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        driver: true,
        vehicle: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assegnazione non trovata" }, { status: 404 });
    }

    const checks = assignment.checks as unknown as Check[];
    const critici = ["peso", "adr", "patente"];
    const blocked = checks.some((c) => !c.passed && critici.includes(c.nome));

    const row: AssignmentRow = {
      id: assignment.id,
      orderId: assignment.orderId,
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
      score: assignment.score,
      maxScore: assignment.maxScore,
      checks,
      motivazione: assignment.motivazione,
      status: assignment.status as "pending" | "approved" | "rejected",
      kmStimati: assignment.kmStimati,
      oreStimate: assignment.oreStimate,
      costoCarburante: assignment.costoCarburante,
      blocked,
      codiceOrdine: assignment.order.codiceOrdine,
      autistaNome: `${assignment.driver.nome} ${assignment.driver.cognome}`,
      mezzoTarga: assignment.vehicle.targa,
      mittenteCitta: assignment.order.mittenteCitta,
      destinatarioCitta: assignment.order.destinatarioCitta,
    };

    return NextResponse.json(row);
  } catch (error) {
    console.error("Assignment fetch error:", error);
    return NextResponse.json({ error: "Errore nel recupero assegnazione" }, { status: 500 });
  }
}
