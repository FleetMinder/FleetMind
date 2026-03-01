import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";

export async function POST(request: NextRequest) {
  try {
    const companyId = await getProtectedCompanyId();
    const body = await request.json();
    const { assignmentIds } = body as { assignmentIds: string[] };

    if (!assignmentIds || assignmentIds.length === 0) {
      return NextResponse.json(
        { error: "Nessun ID assegnazione fornito." },
        { status: 400 }
      );
    }

    // Fetch assignments con relazioni
    const assignments = await prisma.assignment.findMany({
      where: {
        id: { in: assignmentIds },
        companyId,
        status: "pending",
      },
      include: { order: true },
    });

    if (assignments.length === 0) {
      return NextResponse.json(
        { error: "Nessuna assegnazione pending trovata con gli ID forniti." },
        { status: 404 }
      );
    }

    const createdTrips = [];

    for (const assignment of assignments) {
      // Salta assegnazioni bloccate (score critico fallito)
      const checks = assignment.checks as Array<{ nome: string; passed: boolean }>;
      const critici = ["peso", "adr", "patente"];
      const bloccata = checks.some((c) => !c.passed && critici.includes(c.nome));
      if (bloccata) continue;

      await prisma.$transaction(async (tx) => {
        // Crea Trip
        const trip = await tx.trip.create({
          data: {
            companyId,
            driverId: assignment.driverId,
            vehicleId: assignment.vehicleId,
            kmTotali: assignment.kmStimati,
            tempoStimatoMinuti: assignment.oreStimate
              ? Math.round(assignment.oreStimate * 60)
              : null,
            costoCarburanteStimato: assignment.costoCarburante,
            rationale: assignment.motivazione,
            stato: "approvato",
          },
        });

        // Aggiorna Order
        await tx.order.update({
          where: { id: assignment.orderId },
          data: { tripId: trip.id, stato: "assegnato" },
        });

        // Aggiorna Driver
        await tx.driver.update({
          where: { id: assignment.driverId },
          data: { stato: "in_viaggio" },
        });

        // Aggiorna Vehicle
        await tx.vehicle.update({
          where: { id: assignment.vehicleId },
          data: { stato: "in_uso" },
        });

        // Aggiorna Assignment
        await tx.assignment.update({
          where: { id: assignment.id },
          data: { status: "approved" },
        });

        createdTrips.push(trip);
      });
    }

    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: "dispatch_approved",
        messaggio: `Piano dispatch approvato: ${createdTrips.length} tratte confermate su ${assignments.length} assegnazioni`,
      },
    });

    return NextResponse.json({
      success: true,
      tripsCreated: createdTrips.length,
    });
  } catch (error) {
    console.error("Dispatch approve error:", error);
    return NextResponse.json(
      { error: "Errore nell'approvazione del piano" },
      { status: 500 }
    );
  }
}
