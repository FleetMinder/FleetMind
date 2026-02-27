import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";

export async function POST() {
  try {
    const companyId = await getCompanyId();

    await prisma.$transaction(async (tx) => {
      // Reset orders: back to pending, detach from trips
      await tx.order.updateMany({
        where: { companyId },
        data: { tripId: null, stato: "pending" },
      });

      // Delete all trips
      await tx.trip.deleteMany({ where: { companyId } });

      // Reset drivers to disponibile
      await tx.driver.updateMany({
        where: { companyId },
        data: { stato: "disponibile", oreGuidaGiorno: 0 },
      });

      // Reset vehicles to disponibile
      await tx.vehicle.updateMany({
        where: { companyId },
        data: { stato: "disponibile" },
      });

      await tx.activityLog.create({
        data: {
          companyId,
          tipo: "demo_reset",
          messaggio: "Demo ripristinato: tutti i viaggi eliminati, ordini e fleet resettati",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Demo reset error:", error);
    return NextResponse.json({ error: "Errore nel reset demo" }, { status: 500 });
  }
}
