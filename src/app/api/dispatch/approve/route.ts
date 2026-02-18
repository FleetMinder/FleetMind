import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();
    const { trips } = body;

    const createdTrips = [];

    for (const trip of trips) {
      const created = await prisma.trip.create({
        data: {
          companyId,
          driverId: trip.driver_id,
          vehicleId: trip.vehicle_id,
          kmTotali: trip.km_stimati,
          tempoStimatoMinuti: Math.round((trip.ore_stimate || 0) * 60),
          costoCarburanteStimato: trip.costoCarburanteStimato,
          rationale: trip.rationale_it,
          stato: "approvato",
          routeDataJson: trip.routeData || null,
        },
      });

      // Update orders
      await prisma.order.updateMany({
        where: { id: { in: trip.order_ids } },
        data: { tripId: created.id, stato: "assegnato" },
      });

      // Update driver status
      await prisma.driver.update({
        where: { id: trip.driver_id },
        data: { stato: "in_viaggio" },
      });

      // Update vehicle status
      await prisma.vehicle.update({
        where: { id: trip.vehicle_id },
        data: { stato: "in_uso" },
      });

      createdTrips.push(created);
    }

    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: "dispatch_approved",
        messaggio: `Piano dispatch approvato: ${createdTrips.length} tratte confermate`,
      },
    });

    return NextResponse.json({
      success: true,
      trips: createdTrips,
    });
  } catch (error) {
    console.error("Dispatch approve error:", error);
    return NextResponse.json(
      { error: "Errore nell'approvazione del piano" },
      { status: 500 }
    );
  }
}
