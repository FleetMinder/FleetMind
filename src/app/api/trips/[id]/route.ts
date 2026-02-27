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
      include: { orders: { select: { id: true } } },
    });

    if (!trip) {
      return NextResponse.json({ error: "Viaggio non trovato" }, { status: 404 });
    }

    const updated = await prisma.trip.update({
      where: { id: params.id },
      data: { stato },
    });

    // When trip ends, free driver and vehicle
    if (stato === "completato" || stato === "annullato") {
      await Promise.all([
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { stato: "disponibile" },
        }),
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { stato: "disponibile" },
        }),
        // If cancelled, reset orders back to pending
        stato === "annullato"
          ? prisma.order.updateMany({
              where: { id: { in: trip.orders.map((o) => o.id) } },
              data: { stato: "pending", tripId: null },
            })
          : prisma.order.updateMany({
              where: { id: { in: trip.orders.map((o) => o.id) } },
              data: { stato: "completato" },
            }),
      ]);
    }

    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: stato === "completato" ? "trip_completed" : "trip_status",
        messaggio: `Viaggio ${stato === "completato" ? "completato" : "aggiornato a " + stato}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Trip PATCH error:", error);
    return NextResponse.json({ error: "Errore aggiornamento viaggio" }, { status: 500 });
  }
}
