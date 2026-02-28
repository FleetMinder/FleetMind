import { differenceInDays } from "date-fns";
import { verificaAccessoLEZ } from "./costi-minimi-mit";

/**
 * Compliance Engine — FleetMind
 *
 * Genera alert automatici per scadenze normative:
 * - Patente autista
 * - CQC (Carta Qualificazione Conducente)
 * - Tachigrafo (scarico dati ogni 28gg carta, 90gg memoria)
 * - ADR (merci pericolose)
 * - Revisione veicolo
 * - Assicurazione veicolo
 * - Bollo veicolo
 * - Ore guida (Reg. CE 561/2006: max 9h/giorno, 56h/settimana)
 * - Zone LEZ (Euro 5 ban dal ottobre 2026)
 */

export interface ComplianceAlertData {
  tipo: string;
  severity: "critico" | "avviso" | "info";
  entitaTipo: "driver" | "vehicle" | "order";
  entitaId: string;
  entitaNome: string;
  messaggio: string;
  dataScadenza?: Date;
}

// Soglie per gli alert (in giorni)
const SOGLIA_CRITICO = 0;   // Scaduto o oggi
const SOGLIA_AVVISO = 30;   // Entro 30 giorni
const SOGLIA_INFO = 60;     // Entro 60 giorni

interface DriverData {
  id: string;
  nome: string;
  cognome: string;
  patenteScadenza: Date;
  cqcScadenza: Date | null;
  tachigrafoScadenza: Date;
  adrScadenza: Date | null;
  oreGuidaSettimana: number;
  oreGuidaGiorno: number;
}

interface VehicleData {
  id: string;
  targa: string;
  classeEuro: string | null;
  prossimaRevisione: Date | null;
  assicurazioneScadenza: Date | null;
  bolloScadenza: Date | null;
  adrAbilitato: boolean;
  adrScadenza: Date | null;
}

function checkScadenza(
  dataScadenza: Date | null,
  tipo: string,
  entitaTipo: "driver" | "vehicle",
  entitaId: string,
  entitaNome: string,
  labelScadenza: string,
): ComplianceAlertData | null {
  if (!dataScadenza) return null;

  const giorni = differenceInDays(dataScadenza, new Date());

  if (giorni <= SOGLIA_CRITICO) {
    return {
      tipo,
      severity: "critico",
      entitaTipo,
      entitaId,
      entitaNome,
      messaggio: `${labelScadenza} di ${entitaNome}: scadenza superata. Intervenire immediatamente.`,
      dataScadenza,
    };
  }

  if (giorni <= SOGLIA_AVVISO) {
    return {
      tipo,
      severity: "avviso",
      entitaTipo,
      entitaId,
      entitaNome,
      messaggio: `${labelScadenza} di ${entitaNome} scade tra ${giorni} giorni.`,
      dataScadenza,
    };
  }

  if (giorni <= SOGLIA_INFO) {
    return {
      tipo,
      severity: "info",
      entitaTipo,
      entitaId,
      entitaNome,
      messaggio: `${labelScadenza} di ${entitaNome} scade tra ${giorni} giorni. Pianificare il rinnovo.`,
      dataScadenza,
    };
  }

  return null;
}

/**
 * Genera tutti gli alert di compliance per gli autisti
 */
export function checkDriverCompliance(driver: DriverData): ComplianceAlertData[] {
  const alerts: ComplianceAlertData[] = [];
  const nome = `${driver.nome} ${driver.cognome}`;

  // Patente
  const patente = checkScadenza(
    driver.patenteScadenza, "scadenza_patente", "driver", driver.id, nome, "Patente"
  );
  if (patente) alerts.push(patente);

  // CQC
  const cqc = checkScadenza(
    driver.cqcScadenza, "scadenza_cqc", "driver", driver.id, nome, "CQC"
  );
  if (cqc) alerts.push(cqc);

  // Carta Conducente
  const tachigrafo = checkScadenza(
    driver.tachigrafoScadenza, "scadenza_tachigrafo", "driver", driver.id, nome, "Carta Conducente"
  );
  if (tachigrafo) alerts.push(tachigrafo);

  // ADR
  const adr = checkScadenza(
    driver.adrScadenza, "scadenza_adr_autista", "driver", driver.id, nome, "Patentino ADR"
  );
  if (adr) alerts.push(adr);

  // Ore guida giornaliere (max 9h, estensibile a 10h 2 volte a settimana)
  if (driver.oreGuidaGiorno >= 9) {
    alerts.push({
      tipo: "ore_guida_giorno",
      severity: driver.oreGuidaGiorno >= 10 ? "critico" : "avviso",
      entitaTipo: "driver",
      entitaId: driver.id,
      entitaNome: nome,
      messaggio: driver.oreGuidaGiorno >= 10
        ? `${nome}: SUPERATO il limite giornaliero di guida (${driver.oreGuidaGiorno}h/10h max). Fermo obbligatorio.`
        : `${nome}: raggiunto il limite standard giornaliero (${driver.oreGuidaGiorno}h/9h). Estensione possibile max 2 volte a settimana.`,
    });
  }

  // Ore guida settimanali (max 56h, max 90h bisettimanali)
  if (driver.oreGuidaSettimana >= 45) {
    alerts.push({
      tipo: "ore_guida_settimana",
      severity: driver.oreGuidaSettimana >= 56 ? "critico" : "avviso",
      entitaTipo: "driver",
      entitaId: driver.id,
      entitaNome: nome,
      messaggio: driver.oreGuidaSettimana >= 56
        ? `${nome}: SUPERATO il limite settimanale di guida (${driver.oreGuidaSettimana}h/56h). Fermo obbligatorio.`
        : `${nome}: ${driver.oreGuidaSettimana}h/56h settimanali di guida. Attenzione al limite.`,
    });
  }

  return alerts;
}

/**
 * Genera tutti gli alert di compliance per i veicoli
 */
export function checkVehicleCompliance(vehicle: VehicleData): ComplianceAlertData[] {
  const alerts: ComplianceAlertData[] = [];

  // Revisione
  const revisione = checkScadenza(
    vehicle.prossimaRevisione, "scadenza_revisione", "vehicle", vehicle.id, vehicle.targa, "Revisione"
  );
  if (revisione) alerts.push(revisione);

  // Assicurazione
  const assicurazione = checkScadenza(
    vehicle.assicurazioneScadenza, "scadenza_assicurazione", "vehicle", vehicle.id, vehicle.targa, "Assicurazione"
  );
  if (assicurazione) alerts.push(assicurazione);

  // Bollo
  const bollo = checkScadenza(
    vehicle.bolloScadenza, "scadenza_bollo", "vehicle", vehicle.id, vehicle.targa, "Bollo"
  );
  if (bollo) alerts.push(bollo);

  // ADR veicolo
  if (vehicle.adrAbilitato) {
    const adr = checkScadenza(
      vehicle.adrScadenza, "scadenza_adr_veicolo", "vehicle", vehicle.id, vehicle.targa, "Certificato ADR"
    );
    if (adr) alerts.push(adr);
  }

  // Zone LEZ — Euro 5 ban
  const lez = verificaAccessoLEZ(vehicle.classeEuro);
  if (lez.avviso) {
    alerts.push({
      tipo: "euro5_ban",
      severity: "avviso",
      entitaTipo: "vehicle",
      entitaId: vehicle.id,
      entitaNome: vehicle.targa,
      messaggio: lez.avviso,
    });
  }

  return alerts;
}

/**
 * Statistiche compliance aggregate
 */
export function getComplianceStats(alerts: ComplianceAlertData[]) {
  return {
    totale: alerts.length,
    critici: alerts.filter(a => a.severity === "critico").length,
    avvisi: alerts.filter(a => a.severity === "avviso").length,
    info: alerts.filter(a => a.severity === "info").length,
    perTipo: {
      autisti: alerts.filter(a => a.entitaTipo === "driver").length,
      veicoli: alerts.filter(a => a.entitaTipo === "vehicle").length,
    },
  };
}
