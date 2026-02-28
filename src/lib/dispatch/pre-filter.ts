import type { Driver, Vehicle, Order, VehicleType } from "@prisma/client";
import type { PreFilterResult, ValidCombination, UnassignableOrder } from "./types";

// Matrice compatibilità patente → tipi veicolo
const PATENTE_VEICOLI: Record<string, VehicleType[]> = {
  B: ["furgone", "furgone_frigo"],
  C: ["camion", "pianale"],
  CE: ["furgone", "furgone_frigo", "camion", "pianale", "cisterna"],
};

function euclideanKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4; // fattore strada
}

function checkCombination(
  ordine: Order,
  autista: Driver,
  mezzo: Vehicle,
  today: Date
): string[] {
  const motivi: string[] = [];

  // 1. Compatibilità patente con tipo mezzo
  const tipiConsentiti = PATENTE_VEICOLI[autista.patenteTipo] ?? [];
  if (!tipiConsentiti.includes(mezzo.tipo)) {
    motivi.push(
      `Patente ${autista.patenteTipo} non valida per mezzo tipo ${mezzo.tipo}`
    );
  }

  // 2. Patente non scaduta
  if (autista.patenteScadenza < today) {
    motivi.push(
      `Patente scaduta il ${autista.patenteScadenza.toLocaleDateString("it-IT")}`
    );
  }

  // 3. CQC non scaduta (se presente)
  if (autista.cqcScadenza && autista.cqcScadenza < today) {
    motivi.push(
      `CQC scaduta il ${autista.cqcScadenza.toLocaleDateString("it-IT")}`
    );
  }

  // 4. ADR: se merce pericolosa → autista con patentino ADR valido + mezzo abilitato
  if (ordine.mercePericolosa) {
    if (!autista.adrPatentino) {
      motivi.push("Merce pericolosa: autista senza patentino ADR");
    } else if (autista.adrScadenza && autista.adrScadenza < today) {
      motivi.push(
        `Merce pericolosa: patentino ADR scaduto il ${autista.adrScadenza.toLocaleDateString("it-IT")}`
      );
    }
    if (!mezzo.adrAbilitato) {
      motivi.push("Merce pericolosa: mezzo non abilitato ADR");
    }
  }

  // 5. Merce refrigerata → solo furgone_frigo
  if (ordine.merceRefrigerata && mezzo.tipo !== "furgone_frigo") {
    motivi.push(
      `Merce refrigerata richiede furgone_frigo, mezzo è ${mezzo.tipo}`
    );
  }

  // 6. Capacità peso
  if (ordine.pesoKg > mezzo.capacitaPesoKg) {
    motivi.push(
      `Peso ordine ${ordine.pesoKg} kg supera portata mezzo ${mezzo.capacitaPesoKg} kg`
    );
  }

  // 7. Capacità volume
  if (ordine.volumeM3 > mezzo.capacitaVolumeM3) {
    motivi.push(
      `Volume ordine ${ordine.volumeM3} m³ supera volume mezzo ${mezzo.capacitaVolumeM3} m³`
    );
  }

  // 8. Ore di guida disponibili
  const oreDisponibili = Math.max(
    0,
    Math.min(9, 56 - autista.oreGuidaSettimana) - autista.oreGuidaGiorno
  );

  let stimaOre = 2; // fallback se mancano coordinate
  if (
    ordine.mittenteLat && ordine.mittenteLng &&
    ordine.destinatarioLat && ordine.destinatarioLng
  ) {
    const km = euclideanKm(
      ordine.mittenteLat, ordine.mittenteLng,
      ordine.destinatarioLat, ordine.destinatarioLng
    );
    stimaOre = km / 50 + 1.5; // guida + carico/scarico
  }

  if (oreDisponibili < stimaOre) {
    motivi.push(
      `Ore disponibili insufficienti: ${oreDisponibili.toFixed(1)}h disponibili, ${stimaOre.toFixed(1)}h stimate`
    );
  }

  return motivi;
}

export function preFilterCombinations(
  orders: Order[],
  drivers: Driver[],
  vehicles: Vehicle[]
): PreFilterResult {
  const today = new Date();
  const valid: ValidCombination[] = [];
  const unassignable: UnassignableOrder[] = [];

  for (const ordine of orders) {
    const combinazioniValide: ValidCombination[] = [];

    for (const autista of drivers) {
      for (const mezzo of vehicles) {
        const motivi = checkCombination(ordine, autista, mezzo, today);
        if (motivi.length === 0) {
          let stimaOre = 2;
          if (
            ordine.mittenteLat && ordine.mittenteLng &&
            ordine.destinatarioLat && ordine.destinatarioLng
          ) {
            const km = euclideanKm(
              ordine.mittenteLat, ordine.mittenteLng,
              ordine.destinatarioLat, ordine.destinatarioLng
            );
            stimaOre = km / 50 + 1.5;
          }
          combinazioniValide.push({
            orderId: ordine.id,
            driverId: autista.id,
            vehicleId: mezzo.id,
            estimatedHours: Math.round(stimaOre * 10) / 10,
          });
        }
      }
    }

    if (combinazioniValide.length === 0) {
      // Raccoglie tutti i motivi univoci aggregati su tutte le combinazioni fallite
      const tuttiMotivi = new Set<string>();
      for (const autista of drivers) {
        for (const mezzo of vehicles) {
          const motivi = checkCombination(ordine, autista, mezzo, today);
          motivi.forEach((m) => tuttiMotivi.add(m));
        }
      }
      const unassign: UnassignableOrder = {
        orderId: ordine.id,
        codiceOrdine: ordine.codiceOrdine,
        motivi: Array.from(tuttiMotivi),
      };
      unassignable.push(unassign);
    } else {
      valid.push(...combinazioniValide);
    }
  }

  return { valid, unassignable };
}
