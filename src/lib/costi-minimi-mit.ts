/**
 * Costi Minimi di Riferimento MIT (Ministero Infrastrutture e Trasporti)
 *
 * Valori indicativi di riferimento dei costi di esercizio dell'impresa italiana
 * di autotrasporto merci per conto di terzi.
 *
 * Aggiornamento: Decreto Dirigenziale n.279 del 5 agosto 2025 (dati giugno 2025)
 *
 * Classi di peso:
 * - A: fino a 3,5 t
 * - B: da 3,5 a 12 t
 * - C: da 12 a 26 t
 * - D: oltre 26 t
 */

export type ClassePeso = "A" | "B" | "C" | "D";

interface CostiRiferimento {
  classe: ClassePeso;
  descrizione: string;
  pesoMin: number;       // kg
  pesoMax: number;       // kg
  costoPerKm: {
    min: number;         // €/km
    max: number;         // €/km
    medio: number;       // €/km (media usata per calcoli)
  };
  costoOrario: {
    min: number;         // €/ora
    max: number;         // €/ora
  };
  costoFissoAnnuo: {
    min: number;         // €/anno
    max: number;         // €/anno
  };
  percorrenzaMediaAnnua: number; // km/anno
}

// Valori di riferimento MIT aggiornati a giugno 2025
export const COSTI_RIFERIMENTO: CostiRiferimento[] = [
  {
    classe: "A",
    descrizione: "Veicoli fino a 3,5 t",
    pesoMin: 0,
    pesoMax: 3500,
    costoPerKm: { min: 0.82, max: 1.15, medio: 0.98 },
    costoOrario: { min: 28, max: 42 },
    costoFissoAnnuo: { min: 18000, max: 28000 },
    percorrenzaMediaAnnua: 40000,
  },
  {
    classe: "B",
    descrizione: "Veicoli da 3,5 a 12 t",
    pesoMin: 3500,
    pesoMax: 12000,
    costoPerKm: { min: 1.05, max: 1.48, medio: 1.26 },
    costoOrario: { min: 35, max: 52 },
    costoFissoAnnuo: { min: 28000, max: 42000 },
    percorrenzaMediaAnnua: 55000,
  },
  {
    classe: "C",
    descrizione: "Veicoli da 12 a 26 t",
    pesoMin: 12000,
    pesoMax: 26000,
    costoPerKm: { min: 1.35, max: 1.85, medio: 1.60 },
    costoOrario: { min: 42, max: 62 },
    costoFissoAnnuo: { min: 38000, max: 55000 },
    percorrenzaMediaAnnua: 70000,
  },
  {
    classe: "D",
    descrizione: "Veicoli oltre 26 t",
    pesoMin: 26000,
    pesoMax: 44000,
    costoPerKm: { min: 1.55, max: 2.15, medio: 1.85 },
    costoOrario: { min: 48, max: 72 },
    costoFissoAnnuo: { min: 48000, max: 68000 },
    percorrenzaMediaAnnua: 85000,
  },
];

/**
 * Determina la classe di peso MIT di un veicolo
 */
export function getClassePeso(pesoKg: number): ClassePeso {
  if (pesoKg <= 3500) return "A";
  if (pesoKg <= 12000) return "B";
  if (pesoKg <= 26000) return "C";
  return "D";
}

/**
 * Ottieni i costi di riferimento per una classe di peso
 */
export function getCostiByClasse(classe: ClassePeso): CostiRiferimento {
  return COSTI_RIFERIMENTO.find(c => c.classe === classe)!;
}

/**
 * Calcola il costo minimo di riferimento per una tratta
 */
export function calcolaCostoMinimo(params: {
  pesoVeicoloKg: number;
  distanzaKm: number;
  durataOre?: number;
}): {
  classe: ClassePeso;
  costoMinimoKm: number;      // costo basato su €/km
  costoMedioKm: number;
  costoMassimoKm: number;
  costoMinimoOra?: number;    // costo basato su €/ora (se durata fornita)
  riferimento: CostiRiferimento;
} {
  const classe = getClassePeso(params.pesoVeicoloKg);
  const rif = getCostiByClasse(classe);

  const result: ReturnType<typeof calcolaCostoMinimo> = {
    classe,
    costoMinimoKm: rif.costoPerKm.min * params.distanzaKm,
    costoMedioKm: rif.costoPerKm.medio * params.distanzaKm,
    costoMassimoKm: rif.costoPerKm.max * params.distanzaKm,
    riferimento: rif,
  };

  if (params.durataOre) {
    result.costoMinimoOra = rif.costoOrario.min * params.durataOre;
  }

  return result;
}

/**
 * Verifica se una tariffa è sotto i costi minimi MIT
 */
export function verificaTariffa(params: {
  pesoVeicoloKg: number;
  distanzaKm: number;
  tariffaProposta: number;
}): {
  sottoCosto: boolean;
  percentualeSottoCosto: number; // negativo se sotto costo
  costoMinimoRiferimento: number;
  costoMedioRiferimento: number;
  classe: ClassePeso;
  messaggio: string;
} {
  const { costoMinimoKm, costoMedioKm, classe } = calcolaCostoMinimo({
    pesoVeicoloKg: params.pesoVeicoloKg,
    distanzaKm: params.distanzaKm,
  });

  const differenza = params.tariffaProposta - costoMinimoKm;
  const percentuale = (differenza / costoMinimoKm) * 100;
  const sottoCosto = params.tariffaProposta < costoMinimoKm;

  let messaggio: string;
  if (sottoCosto) {
    messaggio = `Tariffa sotto i costi minimi MIT del ${Math.abs(percentuale).toFixed(1)}%. ` +
      `Minimo di riferimento: €${costoMinimoKm.toFixed(2)} per ${params.distanzaKm} km (Classe ${classe}).`;
  } else {
    messaggio = `Tariffa in linea con i costi minimi MIT. ` +
      `Margine: +${percentuale.toFixed(1)}% rispetto al minimo di riferimento.`;
  }

  return {
    sottoCosto,
    percentualeSottoCosto: percentuale,
    costoMinimoRiferimento: costoMinimoKm,
    costoMedioRiferimento: costoMedioKm,
    classe,
    messaggio,
  };
}

/**
 * Zone a Basso Emissione (LEZ) - Nord Italia
 * A partire da ottobre 2026: divieto Euro 5 diesel
 */
export const ZONE_LEZ_NORD_ITALIA = [
  { regione: "Lombardia", comuni: "Comuni > 100.000 abitanti", dataInizio: "2026-10-01", classeMinima: "Euro 6" },
  { regione: "Piemonte", comuni: "Comuni > 100.000 abitanti", dataInizio: "2026-10-01", classeMinima: "Euro 6" },
  { regione: "Emilia-Romagna", comuni: "Comuni > 100.000 abitanti", dataInizio: "2026-10-01", classeMinima: "Euro 6" },
  { regione: "Veneto", comuni: "Comuni > 100.000 abitanti", dataInizio: "2026-10-01", classeMinima: "Euro 6" },
];

/**
 * Verifica se un veicolo può circolare in zone LEZ
 */
export function verificaAccessoLEZ(classeEuro: string | null): {
  accesso: boolean;
  avviso: string | null;
} {
  if (!classeEuro) {
    return { accesso: true, avviso: "Classe Euro non specificata — verificare manualmente l'accesso alle zone LEZ." };
  }

  const classiVietate = ["Euro 0", "Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5"];
  const vietato = classiVietate.some(c => classeEuro.toLowerCase().includes(c.toLowerCase()));

  if (vietato) {
    return {
      accesso: false,
      avviso: `Veicolo ${classeEuro}: da ottobre 2026 sarà vietato nei comuni >100.000 abitanti di Lombardia, Piemonte, Emilia-Romagna e Veneto.`,
    };
  }

  return { accesso: true, avviso: null };
}
