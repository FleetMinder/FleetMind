import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";
import {
  checkDriverCompliance,
  checkVehicleCompliance,
  getComplianceStats,
  type ComplianceAlertData,
} from "@/lib/compliance";

export async function GET() {
  try {
    const companyId = await getProtectedCompanyId();

    const [drivers, vehicles] = await Promise.all([
      prisma.driver.findMany({
        where: { companyId },
        select: {
          id: true,
          nome: true,
          cognome: true,
          patenteScadenza: true,
          cqcScadenza: true,
          tachigrafoScadenza: true,
          adrScadenza: true,
          oreGuidaSettimana: true,
          oreGuidaGiorno: true,
        },
      }),
      prisma.vehicle.findMany({
        where: { companyId },
        select: {
          id: true,
          targa: true,
          classeEuro: true,
          prossimaRevisione: true,
          assicurazioneScadenza: true,
          bolloScadenza: true,
          adrAbilitato: true,
          adrScadenza: true,
        },
      }),
    ]);

    const alerts: ComplianceAlertData[] = [];

    // Check tutti gli autisti
    for (const driver of drivers) {
      alerts.push(...checkDriverCompliance(driver));
    }

    // Check tutti i veicoli
    for (const vehicle of vehicles) {
      alerts.push(...checkVehicleCompliance(vehicle));
    }

    // Ordina: critici prima, poi avvisi, poi info
    const severityOrder = { critico: 0, avviso: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const stats = getComplianceStats(alerts);

    return NextResponse.json({ alerts, stats });
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_EXPIRED") {
      return NextResponse.json({ error: "Trial scaduto" }, { status: 403 });
    }
    console.error("Compliance GET error:", error);
    return NextResponse.json(
      { error: "Errore nel calcolo compliance" },
      { status: 500 }
    );
  }
}
