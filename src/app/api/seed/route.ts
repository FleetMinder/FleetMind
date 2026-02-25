import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  // Solo in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non disponibile in produzione" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const now = new Date();
    const months = (n: number) => new Date(now.getFullYear(), now.getMonth() + n, now.getDate());
    const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

    // Trova o crea company per l'utente
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

    let companyId = user.companyId;

    if (!companyId) {
      const company = await prisma.company.create({
        data: {
          nome: "Trasporti Rossi S.r.l.",
          indirizzo: "Via Industriale 42",
          citta: "Bergamo",
          cap: "24126",
          piva: `DEMO-${Date.now()}`,
          telefono: "+39 035 4284920",
          email: "info@trasportirossi.it",
          onboardingCompleted: true,
        },
      });
      companyId = company.id;
      await prisma.user.update({ where: { id: user.id }, data: { companyId } });
    }

    // Pulisci dati esistenti
    await prisma.order.deleteMany({ where: { companyId } });
    await prisma.trip.deleteMany({ where: { companyId } });
    await prisma.complianceAlert.deleteMany({ where: { companyId } });
    await prisma.activityLog.deleteMany({ where: { companyId } });
    await prisma.partner.deleteMany({ where: { companyId } });

    // Pulisci maintenance per veicoli della company
    const existingVehicles = await prisma.vehicle.findMany({ where: { companyId }, select: { id: true } });
    if (existingVehicles.length > 0) {
      await prisma.maintenance.deleteMany({ where: { vehicleId: { in: existingVehicles.map((v) => v.id) } } });
    }
    await prisma.vehicle.deleteMany({ where: { companyId } });
    await prisma.driver.deleteMany({ where: { companyId } });

    // Crea drivers
    const driversData = [
      { nome: "Marco", cognome: "Bianchi", codiceFiscale: `BNCMRC85M15F205Z`, patenteTipo: "CE", patenteNumero: "BG5284920A", patenteScadenza: months(18), cartaCQC: "CQC-284920", cqcScadenza: months(24), cartaCQCTipo: "merci", adrPatentino: "ADR-BG-1842", adrScadenza: months(12), tachigrafoScadenza: months(8), oreGuidaSettimana: 28, oreGuidaGiorno: 6, oreRiposoRimanenti: 11, stato: "disponibile" as const, telefono: "+39 333 1842590", latitudine: 45.695, longitudine: 9.67 },
      { nome: "Luca", cognome: "Verdi", codiceFiscale: `VRDLCU90A22L219P`, patenteTipo: "CE", patenteNumero: "MI9284751B", patenteScadenza: months(10), cartaCQC: "CQC-184752", cqcScadenza: months(14), cartaCQCTipo: "merci", tachigrafoScadenza: months(3), oreGuidaSettimana: 42, oreGuidaGiorno: 8.5, oreRiposoRimanenti: 9, stato: "in_viaggio" as const, telefono: "+39 340 5928471", latitudine: 42.85, longitudine: 12.57 },
      { nome: "Giuseppe", cognome: "Russo", codiceFiscale: `RSSGPP78T05A944Q`, patenteTipo: "CE", patenteNumero: "BG3847291C", patenteScadenza: months(30), cartaCQC: "CQC-384729", cqcScadenza: months(20), cartaCQCTipo: "merci", adrPatentino: "ADR-BG-9284", adrScadenza: months(6), tachigrafoScadenza: months(14), oreGuidaSettimana: 15, oreGuidaGiorno: 3, oreRiposoRimanenti: 11, stato: "disponibile" as const, telefono: "+39 347 2948571", latitudine: 45.464, longitudine: 9.19 },
      { nome: "Alessandro", cognome: "Ferrari", codiceFiscale: `FRRLSN82E18D969K`, patenteTipo: "C", patenteNumero: "TO7482910D", patenteScadenza: months(6), cartaCQC: "CQC-748291", cqcScadenza: months(8), cartaCQCTipo: "merci", tachigrafoScadenza: months(2), oreGuidaSettimana: 52, oreGuidaGiorno: 9, oreRiposoRimanenti: 5, stato: "riposo" as const, telefono: "+39 328 4829174", latitudine: 45.07, longitudine: 7.69 },
      { nome: "Paolo", cognome: "Esposito", codiceFiscale: `SPSPAL88S25H501R`, patenteTipo: "CE", patenteNumero: "NA2847591E", patenteScadenza: months(12), cartaCQC: "CQC-284759", cqcScadenza: daysAgo(30), cartaCQCTipo: "merci", tachigrafoScadenza: months(10), oreGuidaSettimana: 0, oreGuidaGiorno: 0, oreRiposoRimanenti: 11, stato: "non_disponibile" as const, telefono: "+39 366 7482951", latitudine: 45.695, longitudine: 9.67 },
    ];

    const drivers = [];
    for (const d of driversData) {
      drivers.push(await prisma.driver.create({ data: { ...d, companyId } }));
    }

    // Crea vehicles
    const vehiclesData = [
      { targa: `FN284BG`, tipo: "camion" as const, marca: "Iveco", modello: "S-Way 490", anno: 2022, capacitaPesoKg: 24000, capacitaVolumeM3: 90, consumoKmL: 3.2, stato: "disponibile" as const, kmAttuali: 187420, classeEuro: "Euro 6", pesoComplessivoKg: 44000, assicurazioneScadenza: months(7), bolloScadenza: months(4), prossimaRevisione: months(5), prossimaManutenzione: months(2) },
      { targa: `GH491MI`, tipo: "camion" as const, marca: "DAF", modello: "XF 480", anno: 2021, capacitaPesoKg: 24000, capacitaVolumeM3: 90, consumoKmL: 3.0, stato: "in_uso" as const, kmAttuali: 245810, classeEuro: "Euro 6", pesoComplessivoKg: 44000, assicurazioneScadenza: months(10), bolloScadenza: months(8), prossimaRevisione: months(3), prossimaManutenzione: months(1) },
      { targa: `DP582TO`, tipo: "furgone" as const, marca: "Iveco", modello: "Daily 35-160", anno: 2023, capacitaPesoKg: 1500, capacitaVolumeM3: 16, consumoKmL: 8.5, stato: "disponibile" as const, kmAttuali: 42150, classeEuro: "Euro 6", pesoComplessivoKg: 3500, assicurazioneScadenza: months(11), bolloScadenza: months(6), prossimaRevisione: months(10), prossimaManutenzione: months(4) },
      { targa: `EK739BS`, tipo: "furgone" as const, marca: "Mercedes", modello: "Sprinter 316 CDI", anno: 2023, capacitaPesoKg: 1200, capacitaVolumeM3: 14, consumoKmL: 9.0, stato: "disponibile" as const, kmAttuali: 38900, classeEuro: "Euro 6", pesoComplessivoKg: 3500, assicurazioneScadenza: months(9), bolloScadenza: months(5), prossimaRevisione: months(11), prossimaManutenzione: months(3) },
      { targa: `CA918BG`, tipo: "pianale" as const, marca: "Scania", modello: "R 450", anno: 2018, capacitaPesoKg: 18000, capacitaVolumeM3: 75, consumoKmL: 3.5, stato: "disponibile" as const, kmAttuali: 412300, classeEuro: "Euro 5", pesoComplessivoKg: 26000, assicurazioneScadenza: months(2), bolloScadenza: months(3), prossimaRevisione: months(1) },
      { targa: `FL204CR`, tipo: "furgone_frigo" as const, marca: "Volvo", modello: "FH 460 Frigo", anno: 2021, capacitaPesoKg: 18000, capacitaVolumeM3: 65, consumoKmL: 2.8, stato: "in_uso" as const, kmAttuali: 198750, classeEuro: "Euro 6", pesoComplessivoKg: 26000, assicurazioneScadenza: months(8), bolloScadenza: months(6), prossimaRevisione: months(7), prossimaManutenzione: months(2) },
      { targa: `BN471PV`, tipo: "cisterna" as const, marca: "MAN", modello: "TGX 26.510", anno: 2020, capacitaPesoKg: 24000, capacitaVolumeM3: 32, consumoKmL: 2.9, stato: "disponibile" as const, kmAttuali: 278400, classeEuro: "Euro 6", pesoComplessivoKg: 44000, assicurazioneScadenza: months(5), bolloScadenza: months(9), prossimaRevisione: months(4), prossimaManutenzione: months(1), adrAbilitato: true, adrScadenza: months(10) },
      { targa: `AL592RM`, tipo: "camion" as const, marca: "Renault", modello: "T 480", anno: 2019, capacitaPesoKg: 18000, capacitaVolumeM3: 75, consumoKmL: 3.3, stato: "manutenzione" as const, kmAttuali: 352100, classeEuro: "Euro 6", pesoComplessivoKg: 26000, assicurazioneScadenza: months(3), bolloScadenza: months(7), prossimaRevisione: daysAgo(10) },
    ];

    const vehicles = [];
    for (const v of vehiclesData) {
      vehicles.push(await prisma.vehicle.create({ data: { ...v, companyId } }));
    }

    // Activity logs
    const logsData = [
      { tipo: "order_created", messaggio: "Nuovo ordine ORD-2026-001: Brescia -> Trieste (18t acciaio)", createdAt: daysAgo(0) },
      { tipo: "order_created", messaggio: "Nuovo ordine ORD-2026-002: Parma -> Firenze (12t alimentari)", createdAt: daysAgo(0) },
      { tipo: "trip_planned", messaggio: "Viaggio pianificato: Luca Verdi con DAF XF (580 km)", createdAt: daysAgo(1) },
      { tipo: "driver_status", messaggio: "Alessandro Ferrari in riposo: 52h guida settimanali", createdAt: daysAgo(1) },
      { tipo: "compliance_alert", messaggio: "CRITICO: CQC di Paolo Esposito scaduta", createdAt: daysAgo(2) },
      { tipo: "trip_completed", messaggio: "Viaggio completato: Treviglio -> Bari (920 km)", createdAt: daysAgo(3) },
    ];

    for (const l of logsData) {
      await prisma.activityLog.create({ data: { ...l, companyId } });
    }

    return NextResponse.json({ success: true, message: "Dati demo caricati" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Errore nel caricamento dati demo" }, { status: 500 });
  }
}
