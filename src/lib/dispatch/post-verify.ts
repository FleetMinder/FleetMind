import type { Driver, Vehicle, Order } from "@prisma/client";
import type { Check, CheckName, VerifyResult } from "./types";
import { verificaAccessoLEZ, calcolaCostoMinimo } from "@/lib/costi-minimi-mit";

// Check critici: se falliscono → blocked = true
const CRITICAL_CHECKS: CheckName[] = ["peso", "adr", "patente"];

const PATENTE_VEICOLI_LABEL: Record<string, string[]> = {
  B: ["furgone", "furgone_frigo"],
  C: ["camion", "pianale"],
  CE: ["furgone", "furgone_frigo", "camion", "pianale", "cisterna"],
};

export function postVerifyAssignment(
  ordine: Order,
  autista: Driver,
  mezzo: Vehicle,
  kmStimati: number
): VerifyResult {
  const today = new Date();
  const checks: Check[] = [];

  // 1. Peso
  checks.push({
    nome: "peso",
    passed: ordine.pesoKg <= mezzo.capacitaPesoKg,
    valoreReale: `${ordine.pesoKg.toLocaleString("it-IT")} kg`,
    limite: `${mezzo.capacitaPesoKg.toLocaleString("it-IT")} kg`,
    note: null,
  });

  // 2. Volume
  checks.push({
    nome: "volume",
    passed: ordine.volumeM3 <= mezzo.capacitaVolumeM3,
    valoreReale: `${ordine.volumeM3} m³`,
    limite: `${mezzo.capacitaVolumeM3} m³`,
    note: null,
  });

  // 3. Ore di guida
  const oreDisponibili = Math.max(
    0,
    Math.min(9, 56 - autista.oreGuidaSettimana) - autista.oreGuidaGiorno
  );
  const oreNecessarie = kmStimati / 50 + 1.5;
  checks.push({
    nome: "ore",
    passed: oreDisponibili >= oreNecessarie,
    valoreReale: `${oreNecessarie.toFixed(1)}h necessarie`,
    limite: `${oreDisponibili.toFixed(1)}h disponibili (Reg. CE 561/2006)`,
    note: oreDisponibili < oreNecessarie
      ? `Ore settimana: ${autista.oreGuidaSettimana}/56, ore oggi: ${autista.oreGuidaGiorno}/9`
      : null,
  });

  // 4. ADR
  const needsAdr = ordine.mercePericolosa;
  const hasValidAdr =
    !!autista.adrPatentino &&
    (!autista.adrScadenza || autista.adrScadenza > today) &&
    mezzo.adrAbilitato;
  checks.push({
    nome: "adr",
    passed: !needsAdr || hasValidAdr,
    valoreReale: needsAdr
      ? autista.adrPatentino
        ? `Patentino ADR ${autista.adrScadenza ? "scad. " + autista.adrScadenza.toLocaleDateString("it-IT") : "presente"}`
        : "Nessun patentino ADR"
      : "Non richiesto",
    limite: needsAdr ? "Patentino ADR valido + mezzo abilitato" : "N/A",
    note: needsAdr && !mezzo.adrAbilitato ? "Mezzo non abilitato ADR" : null,
  });

  // 5. Patente
  const tipiConsentiti = PATENTE_VEICOLI_LABEL[autista.patenteTipo] ?? [];
  const patenteCompatibile = tipiConsentiti.includes(mezzo.tipo);
  const patenteNonScaduta = autista.patenteScadenza >= today;
  checks.push({
    nome: "patente",
    passed: patenteCompatibile && patenteNonScaduta,
    valoreReale: `Patente ${autista.patenteTipo} (scad. ${autista.patenteScadenza.toLocaleDateString("it-IT")})`,
    limite: `Richiesta per ${mezzo.tipo}: ${tipiConsentiti.join(", ")}`,
    note: !patenteNonScaduta ? "Patente scaduta" : !patenteCompatibile ? "Patente incompatibile" : null,
  });

  // 6. LEZ
  const lezCheck = verificaAccessoLEZ(mezzo.classeEuro ?? "");
  checks.push({
    nome: "lez",
    passed: lezCheck.accesso,
    valoreReale: `Classe Euro: ${mezzo.classeEuro ?? "non specificata"}`,
    limite: "Euro 6 richiesto nelle zone LEZ (dal 1 ott 2026)",
    note: lezCheck.avviso,
  });

  // 7. MIT costo minimo
  let mitPassed = true;
  let mitValore = "N/A";
  let mitLimite = "N/A";
  let mitNote: string | null = null;

  if (mezzo.pesoComplessivoKg && kmStimati > 0) {
    const mit = calcolaCostoMinimo({
      pesoVeicoloKg: mezzo.pesoComplessivoKg,
      distanzaKm: kmStimati,
    });
    const costoStimato = mit.costoMinimoKm * kmStimati;
    mitValore = `€${costoStimato.toFixed(2)} (${mit.costoMinimoKm.toFixed(3)} €/km)`;
    mitLimite = `Min. MIT classe ${mit.classe}: ${mit.costoMinimoKm.toFixed(3)} €/km`;
    mitPassed = true; // MIT è informativo, non bloccante
    mitNote = `Classe peso ${mit.classe} — costo medio: ${mit.costoMedioKm.toFixed(3)} €/km`;
  }

  checks.push({
    nome: "mit",
    passed: mitPassed,
    valoreReale: mitValore,
    limite: mitLimite,
    note: mitNote,
  });

  const score = checks.filter((c) => c.passed).length;
  const blocked = checks.some(
    (c) => !c.passed && CRITICAL_CHECKS.includes(c.nome)
  );

  return {
    score,
    maxScore: 7,
    checks,
    blocked,
  };
}
