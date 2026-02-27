import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";

export async function GET() {
  try {
    const companyId = await getCompanyId();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      ordiniOggi,
      autistiDisponibili,
      autistiTotali,
      mezziDisponibili,
      mezziTotali,
      tripsAttivi,
      ordiniPending,
      recentLogs,
      drivers,
      trips,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          companyId,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.driver.count({
        where: { companyId, stato: "disponibile" },
      }),
      prisma.driver.count({ where: { companyId } }),
      prisma.vehicle.count({
        where: { companyId, stato: "disponibile" },
      }),
      prisma.vehicle.count({ where: { companyId } }),
      prisma.trip.count({
        where: { companyId, stato: { in: ["in_corso", "approvato"] } },
      }),
      prisma.order.count({
        where: { companyId, stato: "pending" },
      }),
      prisma.activityLog.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.driver.findMany({
        where: { companyId },
        select: {
          id: true,
          nome: true,
          cognome: true,
          stato: true,
          latitudine: true,
          longitudine: true,
        },
      }),
      prisma.trip.findMany({
        where: { companyId, stato: { in: ["in_corso", "approvato", "pianificato"] } },
        include: {
          orders: {
            select: {
              mittenteLat: true,
              mittenteLng: true,
              destinatarioLat: true,
              destinatarioLng: true,
              mittenteCitta: true,
              destinatarioCitta: true,
            },
          },
          driver: { select: { nome: true, cognome: true } },
        },
      }),
    ]);

    const kmPianificati = await prisma.trip.aggregate({
      where: {
        companyId,
        stato: { in: ["pianificato", "approvato", "in_corso"] },
      },
      _sum: { kmTotali: true },
    });

    const costoCarburante = await prisma.trip.aggregate({
      where: {
        companyId,
        stato: { in: ["pianificato", "approvato", "in_corso"] },
      },
      _sum: { costoCarburanteStimato: true },
    });

    return NextResponse.json({
      kpi: {
        ordiniOggi,
        ordiniPending,
        autistiDisponibili,
        autistiTotali,
        mezziDisponibili,
        mezziTotali,
        tripsAttivi,
        kmPianificati: kmPianificati._sum.kmTotali || 0,
        costoCarburante: costoCarburante._sum.costoCarburanteStimato || 0,
      },
      recentLogs,
      drivers,
      trips,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento della dashboard" },
      { status: 500 }
    );
  }
}
