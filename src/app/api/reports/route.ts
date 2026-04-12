import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getProtectedCompanyId();
    const type = request.nextUrl.searchParams.get("type");

    if (type === "compliance") {
      return generateComplianceReport(companyId);
    } else if (type === "drivers") {
      return generateDriversReport(companyId);
    } else if (type === "fleet") {
      return generateFleetReport(companyId);
    } else if (type === "orders") {
      return generateOrdersReport(companyId);
    }

    return NextResponse.json({ error: "Tipo report non valido. Usa: compliance, drivers, fleet, orders" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

async function generateComplianceReport(companyId: string) {
  const [alerts, company] = await Promise.all([
    prisma.complianceAlert.findMany({
      where: { companyId, risolto: false },
      orderBy: [{ severity: "asc" }, { dataScadenza: "asc" }],
    }),
    prisma.company.findUnique({ where: { id: companyId }, select: { nome: true } }),
  ]);

  const now = new Date().toLocaleDateString("it-IT");
  let csv = `REPORT COMPLIANCE - ${company?.nome || "N/A"}\nGenerato il: ${now}\n\n`;
  csv += "Severita;Tipo;Entita;Messaggio;Scadenza\n";

  for (const a of alerts) {
    csv += `${a.severity};${a.tipo};${a.entitaNome};${a.messaggio.replace(/;/g, ",")};${a.dataScadenza?.toLocaleDateString("it-IT") || "N/A"}\n`;
  }

  csv += `\nTotale alert attivi: ${alerts.length}\n`;
  csv += `Critici: ${alerts.filter(a => a.severity === "critico").length}\n`;
  csv += `Avvisi: ${alerts.filter(a => a.severity === "avviso").length}\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="compliance-report-${now.replace(/\//g, "-")}.csv"`,
    },
  });
}

async function generateDriversReport(companyId: string) {
  const [drivers, company] = await Promise.all([
    prisma.driver.findMany({ where: { companyId }, orderBy: { cognome: "asc" } }),
    prisma.company.findUnique({ where: { id: companyId }, select: { nome: true } }),
  ]);

  const now = new Date().toLocaleDateString("it-IT");
  let csv = `REPORT AUTISTI - ${company?.nome || "N/A"}\nGenerato il: ${now}\n\n`;
  csv += "Nome;Cognome;Patente;Scadenza Patente;CQC;Scadenza CQC;ADR;Stato;Ore Oggi;Ore Settimana\n";

  for (const d of drivers) {
    csv += `${d.nome};${d.cognome};${d.patenteTipo};${d.patenteScadenza.toLocaleDateString("it-IT")};`;
    csv += `${d.cartaCQC || "N/A"};${d.cqcScadenza?.toLocaleDateString("it-IT") || "N/A"};`;
    csv += `${d.adrPatentino ? "Si" : "No"};${d.stato};${d.oreGuidaGiorno};${d.oreGuidaSettimana}\n`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="autisti-report-${now.replace(/\//g, "-")}.csv"`,
    },
  });
}

async function generateFleetReport(companyId: string) {
  const [vehicles, company] = await Promise.all([
    prisma.vehicle.findMany({ where: { companyId }, orderBy: { targa: "asc" } }),
    prisma.company.findUnique({ where: { id: companyId }, select: { nome: true } }),
  ]);

  const now = new Date().toLocaleDateString("it-IT");
  let csv = `REPORT FLOTTA - ${company?.nome || "N/A"}\nGenerato il: ${now}\n\n`;
  csv += "Targa;Tipo;Marca;Modello;Capacita Kg;Euro;Stato;Assicurazione;Revisione;ADR\n";

  for (const v of vehicles) {
    csv += `${v.targa};${v.tipo};${v.marca};${v.modello};${v.capacitaPesoKg};`;
    csv += `${v.classeEuro || "N/A"};${v.stato};`;
    csv += `${v.assicurazioneScadenza?.toLocaleDateString("it-IT") || "N/A"};`;
    csv += `${v.prossimaRevisione?.toLocaleDateString("it-IT") || "N/A"};`;
    csv += `${v.adrAbilitato ? "Si" : "No"}\n`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flotta-report-${now.replace(/\//g, "-")}.csv"`,
    },
  });
}

async function generateOrdersReport(companyId: string) {
  const [orders, company] = await Promise.all([
    prisma.order.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.company.findUnique({ where: { id: companyId }, select: { nome: true } }),
  ]);

  const now = new Date().toLocaleDateString("it-IT");
  let csv = `REPORT ORDINI - ${company?.nome || "N/A"}\nGenerato il: ${now}\n\n`;
  csv += "Codice;Da;A;Peso Kg;Volume M3;Urgenza;Stato;Frigo;ADR;Data\n";

  for (const o of orders) {
    csv += `${o.codiceOrdine};${o.mittenteCitta};${o.destinatarioCitta};${o.pesoKg};${o.volumeM3};`;
    csv += `${o.urgenza};${o.stato};${o.merceRefrigerata ? "Si" : "No"};${o.mercePericolosa ? "Si" : "No"};`;
    csv += `${o.createdAt.toLocaleDateString("it-IT")}\n`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ordini-report-${now.replace(/\//g, "-")}.csv"`,
    },
  });
}
